using MedicalDemo.Data.Models;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using MedicalDemo.Models;
using MedicalDemo.Models.DTO.Scheduling;
using Microsoft.EntityFrameworkCore;

namespace MedicalDemo.Services
{
    public class SchedulingMapperService
    {
        private readonly MedicalContext _context;

        public SchedulingMapperService(MedicalContext context)
        {
            _context = context;
        }

        public PGY1DTO MapToPGY1DTO(Residents resident, List<Rotations> rotations, List<Vacations> vacations, List<DatesDTO> dates)
        {
            var committedDates = dates
                .Where(d => d.ResidentId == resident.resident_id && d.IsCommitted)
                .Select(d => d.Date)
                .ToList();

            return new PGY1DTO
            {
                ResidentId = resident.resident_id,
                Name = $"{resident.first_name} {resident.last_name}",
                VacationRequests = new HashSet<DateTime>(vacations.Select(v => v.Date)),
                RolePerMonth = MapRotationsToRoles(rotations),
                CommitedWorkDays = new HashSet<DateTime>(committedDates),
                InTraining = resident.graduate_yr == 1
            };
        }

        public PGY2DTO MapToPGY2DTO(Residents resident, List<Rotations> rotations, List<Vacations> vacations, List<DatesDTO> dates)
        {
            var committedDates = dates
                .Where(d => d.ResidentId == resident.resident_id && d.IsCommitted)
                .Select(d => d.Date)
                .ToList();

            return new PGY2DTO
            {
                ResidentId = resident.resident_id,
                Name = $"{resident.first_name} {resident.last_name}",
                VacationRequests = new HashSet<DateTime>(vacations.Select(v => v.Date)),
                RolePerMonth = MapRotationsToRoles(rotations),
                CommitedWorkDays = new HashSet<DateTime>(committedDates),
                InTraining = resident.graduate_yr == 2
            };
        }

        public PGY3DTO MapToPGY3DTO(Residents resident, List<Vacations> vacations, List<DatesDTO> dates)
        {
            var committedDates = dates
                .Where(d => d.ResidentId == resident.resident_id && d.IsCommitted)
                .Select(d => d.Date)
                .ToList();

            return new PGY3DTO
            {
                ResidentId = resident.resident_id,
                Name = $"{resident.first_name} {resident.last_name}",
                VacationRequests = new HashSet<DateTime>(vacations.Select(v => v.Date)),
                CommitedWorkDays = new HashSet<DateTime>(committedDates)
            };
        }

        public List<DatesDTO> MapToDatesDTOs(List<Dates> dates)
        {
            return dates.Select(d => new DatesDTO
            {
                DateId = d.DateId,
                ScheduleId = d.ScheduleId,
                ResidentId = d.ResidentId,
                Date = d.Date,
                CallType = d.CallType,
                IsCommitted = true  // All existing dates are considered committed
            }).ToList();
        }

        private HospitalRole[] MapRotationsToRoles(List<Rotations> rotations)
        {
            var roles = new HospitalRole[12];
            foreach (var rotation in rotations)
            {
                int monthIndex = DateTime.ParseExact(rotation.Month, "MMMM", CultureInfo.InvariantCulture).Month - 1;
                roles[monthIndex] = MapRotationNameToRole(rotation.Rotation);
            }
            return roles;
        }

        private HospitalRole MapRotationNameToRole(string rotationName)
        {
            rotationName = rotationName.Trim();

            return rotationName switch
            {
                "Inpt Psy" => HospitalRole.Inpatient,
                "Geri" => HospitalRole.Geriatric,
                "PHP/IOP" => HospitalRole.PHPandIOP,
                "Consult" => HospitalRole.PsychConsults,
                "Addiction" => HospitalRole.Addiction,
                "Forensic" => HospitalRole.Forensic,
                "Float" => HospitalRole.Float,
                "Neuro" => HospitalRole.Neurology,
                "IMOP" => HospitalRole.IMOutpatient,
                "IMIP" => HospitalRole.IMInpatient,
                "Night Float" => HospitalRole.NightFloat,
                "Emergency Med" => HospitalRole.EmergencyMed,
                "ER-P" => HospitalRole.NightFloat,
                "ER P/CL" => HospitalRole.NightFloat,
                "Child" => HospitalRole.CAP,
                "Comm" => HospitalRole.CommP,
                "CL/ER P" => HospitalRole.NightFloat,
                "EM" => HospitalRole.EmergencyMed,
                _ => throw new ArgumentException($"Unknown rotation: {rotationName}")
            };
        }
    }
}