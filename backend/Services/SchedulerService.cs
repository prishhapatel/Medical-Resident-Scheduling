// Services/SchedulerService.cs
using MedicalDemo.Data.Models;
using MedicalDemo.Models.DTO.Scheduling;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MedicalDemo.Services
{
    public class SchedulerService
    {
        private readonly MedicalContext _context;
        private readonly SchedulingMapperService _mapper;

        public SchedulerService(MedicalContext context, SchedulingMapperService mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task GenerateTrainingSchedule(int year)
        {
            try
            {
                // Load data
                var residents = await _context.residents.ToListAsync();
                var rotations = await _context.rotations.ToListAsync();
                var vacations = await _context.vacations
                    .Where(v => v.Status == "Confirmed")  // Add this filter
                    .ToListAsync();
                var dates = await _context.dates.ToListAsync();

                // Convert dates to DTOs
                var datesDTOs = _mapper.MapToDatesDTOs(dates);

                // Map to DTOs
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

                var pgy3DTOs = residents
                    .Where(r => r.graduate_yr == 3)
                    .Select(r => _mapper.MapToPGY3DTO(
                        r,
                        vacations.Where(v => v.ResidentId == r.resident_id).ToList(),
                        datesDTOs
                    ))
                    .ToList();

                // Run scheduling
                TrainingScheduler.Training(year, pgy1DTOs, pgy2DTOs, pgy3DTOs);

                // Save schedule first
                var schedule = new Schedules { ScheduleId = Guid.NewGuid(), Status = "Generated" };
                _context.schedules.Add(schedule);

                // Save it to database to ensure foreign key is valid
                await _context.SaveChangesAsync();
                Console.WriteLine($"Saved schedule with ID: {schedule.ScheduleId}");

                // Now add dates
                foreach (var resident in pgy1DTOs.Concat<ResidentDTO>(pgy2DTOs).Concat(pgy3DTOs))
                {
                    foreach (var workDay in resident.WorkDays)
                    {
                        _context.dates.Add(new Dates
                        {
                            DateId = Guid.NewGuid(),
                            ScheduleId = schedule.ScheduleId,
                            ResidentId = resident.ResidentId,
                            Date = workDay,
                            CallType = workDay.DayOfWeek switch
                            {
                                DayOfWeek.Saturday => "24h",
                                DayOfWeek.Sunday => "12h",
                                _ => "Short"
                            }
                        });
                    }

                    resident.SaveWorkDays();
                }

                // Save all dates
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("SaveChangesAsync failed:");
                Console.WriteLine(ex.Message);
                if (ex.InnerException != null)
                {
                    Console.WriteLine("Inner exception:");
                    Console.WriteLine(ex.InnerException.Message);
                }
                throw;
            }
        }
    }
}
