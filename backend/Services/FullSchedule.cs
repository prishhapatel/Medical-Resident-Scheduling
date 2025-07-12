using System;
using System.Collections.Generic;
using System.Linq;
using MedicalDemo.Data.Models;
using MedicalDemo.Models;
using MedicalDemo.Repositories;
using MedicalDemo.Models.DTO.Scheduling;
using Microsoft.EntityFrameworkCore;
using MedicalDemo.Utils;

namespace MedicalDemo.Services
{
    public class FullSchedule
    {
        private readonly MedicalContext _context;
        private readonly SchedulingMapperService _mapper;


        public FullSchedule(MedicalContext context, SchedulingMapperService mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task GenerateSchedule(int year)
        {
            var dates = new List<Dates>();

            // Run both parts
            //var part1 = GeneratePart1(year);
            var part2 = GeneratePart2(year);

            dates.AddRange(part1);
            dates.AddRange(part2);
            //return dates;
        }

        public async Task GeneratePart1Async(int year)
        {
            Console.WriteLine("Part 1: Normal Schedule (July through December)");

            int pgy1Count = 8;
            int pgy2Count = 8;

            var allPgy1s = new List<PGY1DTO>();
            var allPgy2s = new List<PGY2DTO>();

            // Load data
            var residents = await _context.residents.ToListAsync();
            var rotations = await _context.rotations.ToListAsync();
            var vacations = await _context.vacations
                .Where(v => v.Status == "Confirmed")  // Add this filter
                .ToListAsync();
            var dates = await _context.dates.ToListAsync();

            // Convert dates to DTOs
            var datesDTOs = _mapper.MapToDatesDTOs(dates);

            //map to DTO
            var pgy1DTOs = residents
                   .Where(r => r.graduate_yr == 1)
                   .Select(r => _mapper.MapToPGY1DTO(
                       r,
                       rotations.Where(rot => rot.ResidentId == r.resident_id).ToList(),
                       vacations.Where(v => v.ResidentId == r.resident_id).ToList(),
                       datesDTOs
                   ))
                   .ToList();

            var pgy2DTOs = residents
                    .Where(r => r.graduate_yr == 2)
                    .Select(r => _mapper.MapToPGY2DTO(
                        r,
                        rotations.Where(rot => rot.ResidentId == r.resident_id).ToList(),
                        vacations.Where(v => v.ResidentId == r.resident_id).ToList(),
                        datesDTOs
                    ))
                    .ToList();

            // Track worked days
            var workedDays = new HashSet<DateTime>();
            foreach (var r in allPgy1s) workedDays.UnionWith(r.WorkDays);
            foreach (var r in allPgy2s) workedDays.UnionWith(r.WorkDays);

            DateTime startDay = new DateTime(year, 7, 7);
            DateTime endDay = new DateTime(year, 12, 31);

            var shiftTypeCount = new Dictionary<int, int>();
            for (DateTime day = startDay; day <= endDay; day = day.AddDays(1))
            {
                if (workedDays.Contains(day)) continue;
                int type = GetShiftType(day);
                if (!shiftTypeCount.ContainsKey(type)) shiftTypeCount[type] = 0;
                shiftTypeCount[type]++;
            }

            while (!randomAssignment(allPgy1s, allPgy2s, startDay, endDay, shiftTypeCount, workedDays)) { }

            await saveAsync(allPgy1s, allPgy2s, new List<PGY3>()); // Assuming async save
            print(allPgy1s, allPgy2s, new List<PGY3>());

            return allPgy1s.SelectMany(r => r.assignedDates).ToList();
        }


        private List<Dates> GeneratePart2(int year)
        {
            // TODO: Add logic for training schedule (Jan–June)
            return new List<Dates>();
        }


        private int GetShiftType(DateTime curDate)
        {
            return curDate.DayOfWeek switch
            {
                DayOfWeek.Saturday => 24,
                DayOfWeek.Sunday => 12,
                _ => 3,
            };
        }

        public bool RandomAssignment(
    List<PGY1DTO> pgy1s,
    List<PGY2DTO> pgy2s,
    DateTime startDay,
    DateTime endDay,
    Dictionary<int, int> shiftTypeCount,
    HashSet<DateTime> workedDays)
        {
            Console.WriteLine("Attempting random assignment of shifts...");

            var rand = new Random();

            // Initialize shift counters
            var pgy1ShiftCount = pgy1s.Select(_ => new Dictionary<int, int> { [3] = 0, [12] = 0, [24] = 0 }).ToArray();
            var pgy2ShiftCount = pgy2s.Select(_ => new Dictionary<int, int> { [3] = 0, [12] = 0, [24] = 0 }).ToArray();

            // Initial shift distribution logic (implement separately)
            InitialShiftAssignment(
                pgy1s,
                pgy2s,
                shiftTypeCount,
                pgy1ShiftCount,
                pgy2ShiftCount,
                rand
            );
            int[] pgy1WorkTime = new int[pgy1s.Count];
            int[] pgy2WorkTime = new int[pgy2s.Count];
            ComputeWorkTime(pgy1s, pgy2s, pgy1WorkTime, pgy2WorkTime, pgy1ShiftCount, pgy2ShiftCount);

            // Balance hours within 24-hour window
            while (pgy1WorkTime.Concat(pgy2WorkTime).Max() - pgy1WorkTime.Concat(pgy2WorkTime).Min() > 24)
            {
                SwapSomeShiftCount(pgy1s, pgy2s, pgy1ShiftCount, pgy2ShiftCount, rand, pgy1WorkTime, pgy2WorkTime);
                ComputeWorkTime(pgy1s, pgy2s, pgy1WorkTime, pgy2WorkTime, pgy1ShiftCount, pgy2ShiftCount);
            }

            Console.WriteLine("Work hours balanced, building flow graph...");

            // Setup graph
            int totalResidents = pgy1s.Count + pgy2s.Count;
            int totalNodes = totalResidents * 3 + 200 + 2;
            int src = totalNodes - 2;
            int sink = totalNodes - 1;
            var g = new Graph(totalNodes);
            var dayList = new List<DateTime>();

            // Add edges from source to resident shift type nodes
            for (int i = 0; i < pgy1s.Count; i++)
                for (int t = 0; t < 3; t++)
                    g.AddEdge(src, i * 3 + t, pgy1ShiftCount[i][ShiftDuration(t)]);

            for (int i = 0; i < pgy2s.Count; i++)
                for (int t = 0; t < 3; t++)
                    g.AddEdge(src, (pgy1s.Count + i) * 3 + t, pgy2ShiftCount[i][ShiftDuration(t)]);

            // Build day nodes and connect residents
            for (DateTime curDay = startDay; curDay <= endDay; curDay = curDay.AddDays(1))
            {
                if (workedDays.Contains(curDay)) continue;

                dayList.Add(curDay);
                int shiftVal = GetShiftType(curDay);
                int offset = shiftVal == 3 ? 0 : (shiftVal == 12 ? 1 : 2);
                int dayIndex = totalResidents * 3 + dayList.Count - 1;

                for (int i = 0; i < pgy1s.Count; i++)
                    if (pgy1s[i].CanWork(curDay))
                        g.AddEdge(i * 3 + offset, dayIndex, 1);

                for (int i = 0; i < pgy2s.Count; i++)
                    if (pgy2s[i].CanWork(curDay))
                        g.AddEdge((pgy1s.Count + i) * 3 + offset, dayIndex, 1);

                g.AddEdge(dayIndex, sink, 1);
            }

            int flow = g.GetFlow(src, sink);
            Console.WriteLine($"[DEBUG] flow is {flow} out of {dayList.Count}");

            if (flow != dayList.Count)
            {
                Console.WriteLine("[ERROR] Assignment failed: not all days covered.");
                return false;
            }

            // Assign workdays based on flow
            AssignFlowDays(pgy1s, pgy2s, g, dayList, totalResidents);

            Console.WriteLine("[DEBUG] fixing weekends...");
            FixWeekends(pgy1s, pgy2s);

            return true;
        }

        private void InitialShiftAssignment(
    List<PGY1DTO> pgy1s,
    List<PGY2DTO> pgy2s,
    Dictionary<int, int> shiftTypeCount,
    Dictionary<int, int>[] pgy1ShiftCount,
    Dictionary<int, int>[] pgy2ShiftCount,
    Random rand)
        {
            foreach (var shift in shiftTypeCount.Keys)
            {
                for (int i = 0; i < shiftTypeCount[shift]; i++)
                {
                    if (rand.NextDouble() < 0.5) // 50% chance PGY1
                    {
                        int pgy1Index = rand.Next(pgy1s.Count);
                        if (!pgy1ShiftCount[pgy1Index].ContainsKey(shift))
                            pgy1ShiftCount[pgy1Index][shift] = 0;

                        pgy1ShiftCount[pgy1Index][shift]++;
                    }
                    else // PGY2
                    {
                        int pgy2Index = rand.Next(pgy2s.Count);
                        if (!pgy2ShiftCount[pgy2Index].ContainsKey(shift))
                            pgy2ShiftCount[pgy2Index][shift] = 0;

                        pgy2ShiftCount[pgy2Index][shift]++;
                    }
                }
            }
        }

        private void ComputeWorkTime(
    List<PGY1DTO> pgy1s,
    List<PGY2DTO> pgy2s,
    int[] pgy1WorkTime,
    int[] pgy2WorkTime,
    Dictionary<int, int>[] pgy1ShiftCount,
    Dictionary<int, int>[] pgy2ShiftCount)
        {
            for (int i = 0; i < pgy1s.Count; i++)
            {
                pgy1WorkTime[i] = 0;
                var resident = pgy1s[i];

                foreach (var day in resident.WorkDays)
                    pgy1WorkTime[i] += GetShiftType(day); // real shifts already assigned

                foreach (var shift in pgy1ShiftCount[i].Keys)
                    pgy1WorkTime[i] += shift * pgy1ShiftCount[i][shift]; // pending assignments
            }

            for (int i = 0; i < pgy2s.Count; i++)
            {
                pgy2WorkTime[i] = 0;
                var resident = pgy2s[i];

                foreach (var day in resident.WorkDays)
                    pgy2WorkTime[i] += GetShiftType(day);

                foreach (var shift in pgy2ShiftCount[i].Keys)
                    pgy2WorkTime[i] += shift * pgy2ShiftCount[i][shift];
            }
        }

        private void SwapSomeShiftCount(
    List<PGY1DTO> pgy1s,
    List<PGY2DTO> pgy2s,
    Dictionary<int, int>[] pgy1ShiftCount,
    Dictionary<int, int>[] pgy2ShiftCount,
    Random rand,
    int[] pgy1WorkTime,
    int[] pgy2WorkTime)
        {
            int total = pgy1s.Count + pgy2s.Count;

            // 1. Find giver (highest work time)
            int giverIndex = 0;
            int giveHour = -1;

            for (int i = 0; i < pgy1s.Count; i++)
            {
                if (pgy1WorkTime[i] > giveHour)
                {
                    giveHour = pgy1WorkTime[i];
                    giverIndex = i;
                }
            }

            for (int i = 0; i < pgy2s.Count; i++)
            {
                if (pgy2WorkTime[i] > giveHour)
                {
                    giveHour = pgy2WorkTime[i];
                    giverIndex = i + pgy1s.Count;
                }
            }

            // 2. Pick a valid receiver
            int receiverIndex = rand.Next(total);
            int receiveHour = (receiverIndex < pgy1s.Count) ? pgy1WorkTime[receiverIndex] : pgy2WorkTime[receiverIndex - pgy1s.Count];

            while (giverIndex == receiverIndex || giveHour <= receiveHour + 24)
            {
                receiverIndex = rand.Next(total);
                receiveHour = (receiverIndex < pgy1s.Count) ? pgy1WorkTime[receiverIndex] : pgy2WorkTime[receiverIndex - pgy1s.Count];
            }

            // 3. Try to transfer a random shift type (3, 12, or 24)
            while (true)
            {
                int shiftType = rand.Next(0, 3) switch
                {
                    0 => 3,
                    1 => 12,
                    _ => 24
                };

                bool success = false;

                // Giver is PGY1
                if (giverIndex < pgy1s.Count)
                {
                    if (pgy1ShiftCount[giverIndex].TryGetValue(shiftType, out int count) && count > 0)
                    {
                        pgy1ShiftCount[giverIndex][shiftType]--;

                        if (receiverIndex < pgy1s.Count)
                            pgy1ShiftCount[receiverIndex].TryAdd(shiftType, 0);
                        else
                            pgy2ShiftCount[receiverIndex - pgy1s.Count].TryAdd(shiftType, 0);

                        if (receiverIndex < pgy1s.Count)
                            pgy1ShiftCount[receiverIndex][shiftType]++;
                        else
                            pgy2ShiftCount[receiverIndex - pgy1s.Count][shiftType]++;

                        success = true;
                    }
                }
                else // Giver is PGY2
                {
                    int index = giverIndex - pgy1s.Count;
                    if (pgy2ShiftCount[index].TryGetValue(shiftType, out int count) && count > 0)
                    {
                        pgy2ShiftCount[index][shiftType]--;

                        if (receiverIndex < pgy1s.Count)
                            pgy1ShiftCount[receiverIndex].TryAdd(shiftType, 0);
                        else
                            pgy2ShiftCount[receiverIndex - pgy1s.Count].TryAdd(shiftType, 0);

                        if (receiverIndex < pgy1s.Count)
                            pgy1ShiftCount[receiverIndex][shiftType]++;
                        else
                            pgy2ShiftCount[receiverIndex - pgy1s.Count][shiftType]++;

                        success = true;
                    }
                }

                if (success) return;
            }
        }
        private int ShiftDuration(int type)
        {
            return type switch
            {
                0 => 3,
                1 => 12,
                2 => 24,
                _ => throw new ArgumentOutOfRangeException(nameof(type), "Invalid shift type index")
            };
        }

    }
}
