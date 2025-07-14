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

        public async Task<List<Dates>> GenerateSchedule(int year)
        {
            var dates = new List<Dates>();

            // Run both parts
            var part1 = await GeneratePart1Async(year);
            //var part2 = await GeneratePart2Async(year);

            dates.AddRange(part1);
            //dates.AddRange(part2);
            //return dates;

            return dates;

        }

        public async Task<List<Dates>> GeneratePart1Async(int year)
        {
            Console.WriteLine("Part 1: Normal Schedule (July through December)");

            // Load data
            var residents = await _context.residents.ToListAsync();
            var rotations = await _context.rotations.ToListAsync();
            var vacations = await _context.vacations.Where(v => v.Status == "Confirmed").ToListAsync();
            var dates = await _context.dates.ToListAsync();
            var datesDTOs = _mapper.MapToDatesDTOs(dates);

            // Map PGY1 and PGY2 with availability for this year
            var allPgy1s = residents
                .Where(r => r.graduate_yr == 1)
                .Select(r => _mapper.MapToPGY1DTO(
                    r,
                    rotations.Where(rot => rot.ResidentId == r.resident_id).ToList(),
                    vacations.Where(v => v.ResidentId == r.resident_id).ToList(),
                    datesDTOs,
                    year))
                .ToList();

            var allPgy2s = residents
                .Where(r => r.graduate_yr == 2)
                .Select(r => _mapper.MapToPGY2DTO(
                    r,
                    rotations.Where(rot => rot.ResidentId == r.resident_id).ToList(),
                    vacations.Where(v => v.ResidentId == r.resident_id).ToList(),
                    datesDTOs,
                    year))
                .ToList();

            // Track previously worked days
            var workedDays = new HashSet<DateTime>();
            foreach (var p in allPgy1s) workedDays.UnionWith(p.CommitedWorkDays);
            foreach (var p in allPgy2s) workedDays.UnionWith(p.CommitedWorkDays);

            // Schedule window
            var startDay = new DateTime(year, 7, 7);
            var endDay = new DateTime(year, 12, 31);

            // Count shift demands
            var shiftTypeCount = new Dictionary<int, int>();
            for (var day = startDay; day <= endDay; day = day.AddDays(1))
            {
                if (workedDays.Contains(day)) continue;
                int type = GetShiftType(day);
                shiftTypeCount[type] = shiftTypeCount.GetValueOrDefault(type) + 1;
            }

            // Random assignment retry loop
            int attempts = 0;
            while (!RandomAssignment(allPgy1s, allPgy2s, startDay, endDay, shiftTypeCount, workedDays) && attempts++ < 50)
                Console.WriteLine($"Retry #{attempts}");

            if (attempts == 50)
            {
                Console.WriteLine("[FATAL] Could not find valid schedule in 50 tries.");
                return new List<Dates>();
            }

            // Build Dates entities from WorkDays
            var generatedDates = new List<Dates>();

            foreach (var p in allPgy1s)
                generatedDates.AddRange(p.WorkDays.Select(d => new Dates
                {
                    DateId = Guid.NewGuid(),
                    ScheduleId = Guid.Empty,
                    ResidentId = p.ResidentId,
                    Date = d,
                    CallType = GetCallTypeString(d)
                }));

            foreach (var p in allPgy2s)
                generatedDates.AddRange(p.WorkDays.Select(d => new Dates
                {
                    DateId = Guid.NewGuid(),
                    ScheduleId = Guid.Empty,
                    ResidentId = p.ResidentId,
                    Date = d,
                    CallType = GetCallTypeString(d)
                }));

            return generatedDates;
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



        private string GetCallTypeString(DateTime date)
        {
            return date.DayOfWeek switch
            {
                DayOfWeek.Saturday => "24h",
                DayOfWeek.Sunday => "12h",
                _ => "Short"
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
                    bool assigned = false;

                    for (int attempt = 0; attempt < 50 && !assigned; attempt++)
                    {
                        if (rand.NextDouble() < 0.5 && pgy1s.Count > 0) // PGY1
                        {
                            int index = rand.Next(pgy1s.Count);
                            pgy1ShiftCount[index][shift]++;
                            assigned = true;
                        }
                        else if (pgy2s.Count > 0) // PGY2
                        {
                            int index = rand.Next(pgy2s.Count);
                            pgy2ShiftCount[index][shift]++;
                            assigned = true;
                        }
                    }

                    if (!assigned)
                        Console.WriteLine($"[WARN] Could not assign shift type {shift}");
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

        // might be wrong
        private void AssignFlowDays(
            List<PGY1DTO> pgy1s,
            List<PGY2DTO> pgy2s,
            Graph g,
            List<DateTime> dayList,
            int totalResidents)
        {
            for (int i = 0; i < pgy1s.Count; i++)
            {
                for (int type = 0; type < 3; type++)
                {
                    var edges = g.adjList[i * 3 + type] as List<Edge>; // Explicitly cast to the correct type
                    if (edges != null)
                    {
                        foreach (var edge in edges)
                        {
                            if (edge.Flow() > 0)
                            {
                                int dayIndex = edge.destination - (totalResidents * 3);
                                DateTime workDay = dayList[dayIndex];
                                pgy1s[i].AddWorkDay(workDay);
                            }
                        }
                    }
                }
            }

            for (int i = 0; i < pgy2s.Count; i++)
            {
                for (int type = 0; type < 3; type++)
                {
                    var edges = g.adjList[(pgy1s.Count + i) * 3 + type] as List<Edge>; // Explicitly cast to the correct type
                    if (edges != null)
                    {
                        foreach (var edge in edges)
                        {
                            if (edge.Flow() > 0)
                            {
                                int dayIndex = edge.destination - (totalResidents * 3);
                                DateTime workDay = dayList[dayIndex];
                                pgy2s[i].AddWorkDay(workDay);
                            }
                        }
                    }
                }
            }
        }


        private void FixWeekends(List<PGY1DTO> pgy1s, List<PGY2DTO> pgy2s)
        {
            foreach (var res in pgy1s)
            {
                DateTime firstDay = res.FirstWorkDay();
                DateTime lastDay = res.LastWorkDay();

                for (DateTime curDay = firstDay; curDay <= lastDay; curDay = curDay.AddDays(1))
                {
                    if (res.IsWorking(curDay) && !res.CanWork(curDay) && !res.CommitedWorkDay(curDay))
                    {
                        bool found = false;

                        // Try to swap with another PGY1
                        foreach (var res2 in pgy1s)
                        {
                            if (res == res2 || !res2.CanWork(curDay)) continue;

                            foreach (var otherDay in res2.WorkDays)
                            {
                                if (GetShiftType(curDay) == GetShiftType(otherDay) &&
                                    res.CanWork(otherDay) && !res2.CommitedWorkDay(otherDay))
                                {
                                    SwapWorkDays1(res, res2, curDay, otherDay);
                                    found = true;
                                    break;
                                }
                            }
                            if (found) break;
                        }

                        // Try to swap with a PGY2
                        if (!found)
                        {
                            foreach (var res2 in pgy2s)
                            {
                                if (!res2.CanWork(curDay)) continue;

                                foreach (var otherDay in res2.WorkDays)
                                {
                                    if (GetShiftType(curDay) == GetShiftType(otherDay) &&
                                        res.CanWork(otherDay) && !res2.CommitedWorkDay(otherDay))
                                    {
                                        SwapWorkDays12(res, res2, curDay, otherDay);
                                        found = true;
                                        break;
                                    }
                                }
                                if (found) break;
                            }
                        }
                    }
                }
            }

            foreach (var res in pgy2s)
            {
                DateTime firstDay = res.FirstWorkDay();
                DateTime lastDay = res.LastWorkDay();

                for (DateTime curDay = firstDay; curDay <= lastDay; curDay = curDay.AddDays(1))
                {
                    if (res.IsWorking(curDay) && !res.CanWork(curDay) && !res.CommitedWorkDay(curDay))
                    {
                        bool found = false;

                        // Try to swap with another PGY2
                        foreach (var res2 in pgy2s)
                        {
                            if (res == res2 || !res2.CanWork(curDay)) continue;

                            foreach (var otherDay in res2.WorkDays)
                            {
                                if (GetShiftType(curDay) == GetShiftType(otherDay) &&
                                    res.CanWork(otherDay) && !res2.CommitedWorkDay(otherDay))
                                {
                                    SwapWorkDays2(res, res2, curDay, otherDay);
                                    found = true;
                                    break;
                                }
                            }
                            if (found) break;
                        }

                        // Try to swap with a PGY1
                        if (!found)
                        {
                            foreach (var res2 in pgy1s)
                            {
                                if (!res2.CanWork(curDay)) continue;

                                foreach (var otherDay in res2.WorkDays)
                                {
                                    if (GetShiftType(curDay) == GetShiftType(otherDay) &&
                                        res.CanWork(otherDay) && !res2.CommitedWorkDay(otherDay))
                                    {
                                        SwapWorkDays12(res2, res, otherDay, curDay);
                                        found = true;
                                        break;
                                    }
                                }
                                if (found) break;
                            }
                        }
                    }
                }
            }
        }
        private void SwapWorkDays1(PGY1DTO res1, PGY1DTO res2, DateTime day1, DateTime day2)
        {
            res1.RemoveWorkDay(day1);
            res2.RemoveWorkDay(day2);

            res1.AddWorkDay(day2);
            res2.AddWorkDay(day1);
        }

        private void SwapWorkDays12(PGY1DTO res1, PGY2DTO res2, DateTime day1, DateTime day2)
        {
            res1.RemoveWorkDay(day1);
            res2.RemoveWorkDay(day2);

            res1.AddWorkDay(day2);
            res2.AddWorkDay(day1);
        }
        private void SwapWorkDays2(PGY2DTO res1, PGY2DTO res2, DateTime day1, DateTime day2)
        {
            res1.RemoveWorkDay(day1);
            res2.RemoveWorkDay(day2);

            res1.AddWorkDay(day2);
            res2.AddWorkDay(day1);
        }

    }
}
