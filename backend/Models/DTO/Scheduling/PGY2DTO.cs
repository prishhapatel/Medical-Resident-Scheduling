using System;
using System.Collections.Generic;
using System.Linq;

namespace MedicalDemo.Models.DTO.Scheduling
{
    public class PGY2DTO : ResidentDTO
    {
        public HospitalRole[] RolePerMonth { get; set; } = new HospitalRole[12];

        // Tracking hours for reporting
        public int HoursWorked6Months { get; set; }
        public int HoursWorkedTotal { get; set; }

        // List of dates resident is eligible to work (populated in mapper)
        public List<DateTime> AvailableDays { get; set; } = new List<DateTime>();

        public bool IsVacation(DateTime curDay) => VacationRequests.Contains(curDay);
        public bool IsWorking(DateTime curDay) => WorkDays.Contains(curDay);

        public override bool CanWork(DateTime curDay)
        {
            // Must be in available window
            if (!AvailableDays.Contains(curDay))
                return false;

            if (IsVacation(curDay))
                return false;

            int monthIndex = (curDay.Month + 5) % 12;
            var role = RolePerMonth[monthIndex];
            if (role == null)
            {
                Console.WriteLine($"[WARN] {ResidentId} has no role assigned for {curDay.ToShortDateString()}.");
                return false;
            }

            if (curDay.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday)
            {
                if (!role.DoesLong && (!InTraining || !role.FlexLong))
                    return false;

                DateTime prevDay = curDay.AddDays(-1);
                DateTime nextDay = curDay.AddDays(1);
                if (WorkDays.Contains(prevDay) || WorkDays.Contains(nextDay))
                    return false;
            }
            else // Weekday
            {
                if (!role.DoesShort && (!InTraining || !role.FlexShort))
                    return false;

                DateTime nextDay = curDay.AddDays(1);
                DateTime prevDay = curDay.AddDays(-1);
                if (WorkDays.Contains(nextDay) && nextDay.DayOfWeek == DayOfWeek.Saturday)
                    return false;
                if (WorkDays.Contains(prevDay) && prevDay.DayOfWeek == DayOfWeek.Sunday)
                    return false;
            }

            return true;
        }

        public DateTime LastWorkDay() => WorkDays.Count > 0 ? WorkDays.Max() : DateTime.MinValue;
        public DateTime FirstWorkDay() => WorkDays.Count > 0 ? WorkDays.Min() : DateTime.MaxValue;

        public override void AddWorkDay(DateTime curDay)
        {
            if (WorkDays.Contains(curDay))
                throw new InvalidOperationException("Resident already scheduled this day");
            WorkDays.Add(curDay);
        }

        public override void RemoveWorkDay(DateTime curDay)
        {
            if (!WorkDays.Contains(curDay))
                throw new InvalidOperationException("Resident not scheduled this day");
            WorkDays.Remove(curDay);
        }

        /// <summary>
        /// Freeze current WorkDays into committed schedule
        /// </summary>
        public void SaveWorkDays()
        {
            foreach (var day in WorkDays)
                CommitedWorkDays.Add(day);
        }

        /// <summary>
        /// Compute total hours from assigned WorkDays
        /// </summary>
        public int TotalHoursWorked()
        {
            return WorkDays.Sum(d => d.DayOfWeek switch
            {
                DayOfWeek.Saturday => 24,
                DayOfWeek.Sunday => 12,
                _ => 3
            });
        }
    }
}
