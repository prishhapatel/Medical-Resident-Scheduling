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
        private readonly MiscService _misc;

        public SchedulerService(MedicalContext context, SchedulingMapperService mapper, MiscService misc)
        {
            _context = context;
            _mapper = mapper;
            _misc = misc;
        }

        public async Task<(bool Success, string Error)> GenerateFullSchedule(int year)
        {
            try
            {
                var residentData = await LoadResidentData(year);
                
                // Map DTOs to original algorithm classes
                var pgy1Models = residentData.PGY1s.Select(dto => MapToPGY1(dto)).ToList();
                var pgy2Models = residentData.PGY2s.Select(dto => MapToPGY2(dto)).ToList();
                var pgy3Models = residentData.PGY3s.Select(dto => MapToPGY3(dto)).ToList();

                // Phase 1: Training Schedule (July–August)
                Schedule.Training(year, pgy1Models, pgy2Models, pgy3Models);

                // Phase 2: Normal Schedule (Sept–Dec and Jan–June)
                Schedule.Part1(year, pgy1Models, pgy2Models);
                Schedule.Part2(year, pgy1Models, pgy2Models);

                // Save schedule record
                var schedule = new Schedules { ScheduleId = Guid.NewGuid(), Status = "Under Review" };
                _context.schedules.Add(schedule);
                await _context.SaveChangesAsync();

                // Generate DatesDTOs from PGY models
                var dateDTOs = Schedule.GenerateDateRecords(schedule.ScheduleId, pgy1Models, pgy2Models, pgy3Models);

                // Convert DTOs to Entities
                var dateEntities = dateDTOs.Select(dto => new Dates
                {
                    DateId = dto.DateId,
                    ScheduleId = dto.ScheduleId,
                    ResidentId = dto.ResidentId,
                    Date = dto.Date,
                    CallType = dto.CallType
                }).ToList();

                
                await _context.dates.AddRangeAsync(dateEntities);
                await _context.SaveChangesAsync();

                await _misc.FindTotalHours();
                await _misc.FindBiYearlyHours(year);

                return (true, null);
            }
            catch (Exception ex)
            {
                return (false, ex.Message);
            }
        }

        private PGY1 MapToPGY1(PGY1DTO dto)
        {
            var model = new PGY1(dto.Name)
            {
                id = dto.ResidentId,  
                inTraining = dto.InTraining,
                lastTrainingDate = dto.LastTrainingDate
            };

            for (int i = 0; i < 12; i++)
                model.rolePerMonth[i] = dto.RolePerMonth[i];

            foreach (var v in dto.VacationRequests)
                model.requestVacation(v);

            foreach (var c in dto.CommitedWorkDays)
                model.addWorkDay(c);

            return model;
        }

        private PGY2 MapToPGY2(PGY2DTO dto)
        {
            var model = new PGY2(dto.Name)
            {
                id = dto.ResidentId,  
                inTraining = dto.InTraining
            };

            for (int i = 0; i < 12; i++)
                model.rolePerMonth[i] = dto.RolePerMonth[i];

            foreach (var v in dto.VacationRequests)
                model.requestVacation(v);

            foreach (var c in dto.CommitedWorkDays)
                model.addWorkDay(c);

            return model;
        }

        private PGY3 MapToPGY3(PGY3DTO dto)
        {
            var model = new PGY3(dto.Name)
            {
                id = dto.ResidentId  
            };

            foreach (var v in dto.VacationRequests)
                model.requestVacation(v);

            foreach (var c in dto.CommitedWorkDays)
                model.addWorkDay(c);

            return model;
        }


        private async Task<ResidentData> LoadResidentData(int year)
        {
            var residents = await _context.residents.ToListAsync();
            var rotations = await _context.rotations.ToListAsync();
            var vacations = await _context.vacations.Where(v => v.Status == "Confirmed").ToListAsync();
            var datesDTOs = new List<DatesDTO>(); // Empty list

            var pgy1s = residents
                .Where(r => r.graduate_yr == 1)
                .Select(r => _mapper.MapToPGY1DTO(r,
                    rotations.Where(rot => rot.ResidentId == r.resident_id).ToList(),
                    vacations.Where(v => v.ResidentId == r.resident_id).ToList(),
                    datesDTOs)).ToList();

            var pgy2s = residents
                .Where(r => r.graduate_yr == 2)
                .Select(r => _mapper.MapToPGY2DTO(r,
                    rotations.Where(rot => rot.ResidentId == r.resident_id).ToList(),
                    vacations.Where(v => v.ResidentId == r.resident_id).ToList(),
                    datesDTOs)).ToList();

            var pgy3s = residents
                .Where(r => r.graduate_yr == 3)
                .Select(r => _mapper.MapToPGY3DTO(r,
                    vacations.Where(v => v.ResidentId == r.resident_id).ToList(),
                    datesDTOs)).ToList();

            return new ResidentData { PGY1s = pgy1s, PGY2s = pgy2s, PGY3s = pgy3s };
        }
    }
}
