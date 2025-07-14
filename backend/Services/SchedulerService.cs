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
    public class SchedulerService
    {
        private readonly MedicalContext _context;
        private readonly SchedulingMapperService _mapper;

        public SchedulerService(MedicalContext context, SchedulingMapperService mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<(bool Success, string Error)> GenerateFullSchedule(int year)
        {
            try
            {
                var residentData = await LoadResidentData(year);

                PrintResidentDebugInfo(residentData);

                // Phase 1: Training Schedule (July–August)
                Schedule.Training(year, residentData.PGY1s, residentData.PGY2s, residentData.PGY3s);

                // Phase 2: Normal Schedule (Sept–Dec and Jan–June)
                Schedule.Part1(year, residentData.PGY1s, residentData.PGY2s);
                Schedule.Part2(year, residentData.PGY1s, residentData.PGY2s);

                // Save schedule first
                var schedule = new Schedules { ScheduleId = Guid.NewGuid(), Status = "Generated" };
                _context.schedules.Add(schedule);
                await _context.SaveChangesAsync();

                // Save to DB
                var dateRecords = Schedule.GenerateDateRecords(schedule.ScheduleId, residentData.PGY1s, residentData.PGY2s, residentData.PGY3s);
                await _context.dates.AddRangeAsync(dateRecords);
                await _context.SaveChangesAsync();

                return (true, null);
            }
            catch (Exception ex)
            {
                return (false, ex.Message);
            }
        }

        private void PrintResidentDebugInfo(ResidentData data)
        {
            Console.WriteLine("\n=== Resident Debug Info ===\n");

            void PrintRoles(string label, List<ResidentDTO> group)
            {
                foreach (var res in group)
                {
                    Console.WriteLine($"{label}: {res.Name}");
                    Console.WriteLine($"  In Training: {res.InTraining}");
                    for (int i = 0; i < res.RolePerMonth.Length; i++)
                    {
                        var role = res.RolePerMonth[i];
                        string monthName = new DateTime(2025, ((i + 7 - 1) % 12) + 1, 1).ToString("MMMM");
                        if (role != null)
                        {
                            Console.WriteLine($"    {monthName}: DoesShort={role.DoesShort}, FlexShort={role.FlexShort}, DoesLong={role.DoesLong}, FlexLong={role.FlexLong}");
                        }
                        else
                        {
                            Console.WriteLine($"    {monthName}: (null role)");
                        }
                    }
                    Console.WriteLine();
                }
            }

            PrintRoles("PGY1", data.PGY1s.Cast<ResidentDTO>().ToList());
            PrintRoles("PGY2", data.PGY2s.Cast<ResidentDTO>().ToList());
            PrintRoles("PGY3", data.PGY3s.Cast<ResidentDTO>().ToList());

            Console.WriteLine("==========================\n");
        }

        private async Task<ResidentData> LoadResidentData(int year)
        {
            var residents = await _context.residents.ToListAsync();
            var rotations = await _context.rotations.ToListAsync();
            var vacations = await _context.vacations
                .Where(v => v.Status == "Confirmed")
                .ToListAsync();
            var existingDates = await _context.dates.ToListAsync();
            var datesDTOs = _mapper.MapToDatesDTOs(existingDates);

            return new ResidentData
            {
                PGY1s = residents
                    .Where(r => r.graduate_yr == 1)
                    .Select(r => _mapper.MapToPGY1DTO(
                        r,
                        rotations.Where(rot => rot.ResidentId == r.resident_id).ToList(),
                        vacations.Where(v => v.ResidentId == r.resident_id).ToList(),
                        datesDTOs))
                    .ToList(),
                PGY2s = residents
                    .Where(r => r.graduate_yr == 2)
                    .Select(r => _mapper.MapToPGY2DTO(
                        r,
                        rotations.Where(rot => rot.ResidentId == r.resident_id).ToList(),
                        vacations.Where(v => v.ResidentId == r.resident_id).ToList(),
                        datesDTOs))
                    .ToList(),
                PGY3s = residents
                    .Where(r => r.graduate_yr == 3)
                    .Select(r => _mapper.MapToPGY3DTO(
                        r,
                        vacations.Where(v => v.ResidentId == r.resident_id).ToList(),
                        datesDTOs))
                    .ToList()
            };
        }
    }
}
