using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MedicalDemo.Algorithm;
using MedicalDemo.Data;
using MedicalDemo.Data.Models;
using MedicalDemo.Models.DTO.Scheduling;
using Microsoft.EntityFrameworkCore;


namespace MedicalDemo.Services
{
    public class MiscService
    {

        private readonly MedicalContext _context;

        public MiscService(MedicalContext context)
        {
            _context = context;
        }

        public async Task<List<Residents>> FindTotalHours()
        {
            var residents = await _context.residents.ToListAsync();
            var dates = await _context.dates.ToListAsync();

            var datesForCurrentYear = dates;

            var residentsWithDates = new List<ResidentWithDates>();


            foreach (var resident in residents) {
                var datesForResident = datesForCurrentYear
                          .Where(d => d.ResidentId == resident.resident_id)
                          .ToList();

                int totalHours = 0;
                foreach (var date in datesForResident)
                {
                    totalHours += HoursByCallType(date.CallType);
                }

                resident.total_hours = totalHours;

            }

          

            // saves to db
            await _context.SaveChangesAsync();

            return residents;
        }

        public async Task<List<Residents>> FindBiYearlyHours(int year)
        {
            var residents = await _context.residents.ToListAsync();
            var dates = await _context.dates.ToListAsync();

            var filteredDates = dates
                    .Where(d => d.Date.Year == year && d.Date.Month >= 7 && d.Date.Month <= 12)
                    .ToList();



            var residentsWithDates = new List<ResidentWithDates>();


            foreach (var resident in residents)
            {
                var datesForResident = filteredDates
                          .Where(d => d.ResidentId == resident.resident_id)
                          .ToList();

                int totalHours = 0;
                foreach (var date in datesForResident)
                {
                    totalHours += HoursByCallType(date.CallType);
                }

                resident.bi_yearly_hours = totalHours;

            }

            

            // saves to db
            await _context.SaveChangesAsync();

            return residents;



        }

        // call types to total hours by call types
        private int HoursByCallType(string callType)
        {
            return callType switch
            {
                "Short" => 3,
                "12h" => 12,
                "24h" => 24,
                _ => 0
            };
        }


        public class ResidentWithDates
        {
            public Residents Resident { get; set; }
            public List<Dates> Dates { get; set; }
        }




    }
}
