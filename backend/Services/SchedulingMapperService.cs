using MedicalDemo.Data.Models;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using MedicalDemo.Models.DTO.Scheduling;
using MedicalDemo.Models;

namespace MedicalDemo.Services
{
    public class SchedulingMapperService
    {
        private readonly MedicalContext _context;

        public SchedulingMapperService(MedicalContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Maps a Resident to PGY1DTO, including available days for July-Dec of the given year.
        /// </summary>
        public PGY1DTO MapToPGY1DTO(
            Residents resident,
            List<Rotations> rotations,
            List<Vacations> vacations,
            List<DatesDTO> dates,
            int year)
        {
            // Existing committed dates
            var committedDates = dates
                .Where(d => d.ResidentId == resident.resident_id && d.IsCommitted)
                .Select(d => d.Date)
                .ToList();

            var dto = new PGY1DTO
            {
                ResidentId = resident.resident_id,
                Name = $"{resident.first_name} {resident.last_name}",
                VacationRequests = new HashSet<DateTime>(vacations.Select(v => v.Date)),
                RolePerMonth = MapRotationsToRoles(rotations),
                CommitedWorkDays = new HashSet<DateTime>(committedDates),
                InTraining = resident.graduate_yr == 1
            };

            // Build AvailableDays: July 7 through Dec 31 of schedule year
            var startDate = new DateTime(year, 7, 7);
            var endDate = new DateTime(year, 12, 31);
            dto.AvailableDays = Enumerable.Range(0, (endDate - startDate).Days + 1)
                .Select(offset => startDate.AddDays(offset))
                .Where(d => !dto.VacationRequests.Contains(d) && !dto.CommitedWorkDays.Contains(d))
                .ToList();

            return dto;
        }

        /// <summary>
        /// Maps a Resident to PGY2DTO, including available days for July-Dec of the given year.
        /// </summary>
        public PGY2DTO MapToPGY2DTO(
            Residents resident,
            List<Rotations> rotations,
            List<Vacations> vacations,
            List<DatesDTO> dates,
            int year)
        {
            var committedDates = dates
                .Where(d => d.ResidentId == resident.resident_id && d.IsCommitted)
                .Select(d => d.Date)
                .ToList();

            var dto = new PGY2DTO
            {
                ResidentId = resident.resident_id,
                Name = $"{resident.first_name} {resident.last_name}",
                VacationRequests = new HashSet<DateTime>(vacations.Select(v => v.Date)),
                RolePerMonth = MapRotationsToRoles(rotations),
                CommitedWorkDays = new HashSet<DateTime>(committedDates),
                InTraining = resident.graduate_yr == 2
            };

            // Build AvailableDays: July 7 through Dec 31 of schedule year
            var startDate = new DateTime(year, 7, 7);
            var endDate = new DateTime(year, 12, 31);
            dto.AvailableDays = Enumerable.Range(0, (endDate - startDate).Days + 1)
                .Select(offset => startDate.AddDays(offset))
                .Where(d => !dto.VacationRequests.Contains(d) && !dto.CommitedWorkDays.Contains(d))
                .ToList();

            return dto;
        }

        // other methods unchanged...

        public List<DatesDTO> MapToDatesDTOs(List<Dates> dates)
        {
            return dates
              .Select(d => new DatesDTO
              {
                  DateId = d.DateId,
                  ScheduleId = d.ScheduleId,
                  ResidentId = d.ResidentId,
                  Date = d.Date,
                  CallType = d.CallType,
                  IsCommitted = true
              })
              .ToList();
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
