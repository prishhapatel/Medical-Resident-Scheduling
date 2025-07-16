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
                // Save schedule record
                var schedule = new Schedules { ScheduleId = Guid.NewGuid(), Status = "Generated" };
                _context.schedules.Add(schedule);
                await _context.SaveChangesAsync();
                
                // Run the full training and normal schedule generation (internal state stored in Schedule.cs)
                await Schedule.Training(year, schedule.ScheduleId, _context);
                await Schedule.Part1(year, schedule.ScheduleId, _context);
                await Schedule.Part2(year, schedule.ScheduleId, _context);

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
                inTraining = dto.InTraining,
                lastTrainingDate = dto.LastTrainingDate,
                id = dto.Id
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
                inTraining = dto.InTraining,
                id = dto.Id
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
                id = dto.Id
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
            var existingDates = await _context.dates.ToListAsync();
            var datesDTOs = _mapper.MapToDatesDTOs(existingDates);

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
