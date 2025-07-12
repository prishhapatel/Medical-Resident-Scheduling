using System;
using System.Collections.Generic;
using System.Linq;
using MedicalDemo.Data.Models;
using MedicalDemo.Models;
using MedicalDemo.Repositories;
using MedicalDemo.Models.DTO.Scheduling;
using Microsoft.EntityFrameworkCore;

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

        public async Task GeneratePart1(int year)
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


            //for (int i = 0; i < pgy1Count; i++)
            //{
            //    var pgy1 = LoadPGY1(i);
            //    pgy1.inTraining = false;
            //    pgy1.lastTrainingDate = pgy1.workDaySet().Max();
            //    allPgy1s.Add(pgy1);
            //}

            //for (int i = 0; i < pgy2Count; i++)
            //{
            //    var pgy2 = LoadPGY2(i);
            //    pgy2.inTraining = false;
            //    allPgy2s.Add(pgy2);
            //}

            //var workedDays = new HashSet<DateTime>();
            //foreach (var res in allPgy1s) workedDays.UnionWith(res.workDaySet());
            //foreach (var res in allPgy2s) workedDays.UnionWith(res.workDaySet());

            //DateTime startDay = new DateTime(year, 7, 7);
            //DateTime endDay = new DateTime(year, 12, 31);

            //var shiftTypeCount = new Dictionary<int, int>();
            //for (DateTime curDay = startDay; curDay <= endDay; curDay = curDay.AddDays(1))
            //{
            //    if (workedDays.Contains(curDay)) continue;

            //    int type = shiftType(curDay);
            //    if (!shiftTypeCount.ContainsKey(type)) shiftTypeCount[type] = 0;
            //    shiftTypeCount[type]++;
            //}

            //while (!randomAssignment(allPgy1s, allPgy2s, startDay, endDay, shiftTypeCount, workedDays)) { }

            //save(allPgy1s, allPgy2s, new List<PGY3>());  // PGY3s unused
            //print(allPgy1s, allPgy2s, new List<PGY3>());

            //// Return the full list of Dates generated for the DB/UI
            //return allPgy1s.SelectMany(r => r.assignedDates).ToList();
        }


        private List<Dates> GeneratePart2(int year)
        {
            // TODO: Add logic for training schedule (Jan–June)
            return new List<Dates>();
        }
    }
}
