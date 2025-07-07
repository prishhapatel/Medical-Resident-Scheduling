namespace MedicalDemo.Models.DTO.Scheduling
{
    public class PGY3DTO : ResidentDTO
    {
        public bool IsVacation(DateTime curDay) => VacationRequests.Contains(curDay);
        public bool IsWorking(DateTime curDay) => WorkDays.Contains(curDay);
        
        public void RequestVacation(DateTime curDay)
        {
            if (IsVacation(curDay)) return;
            VacationRequests.Add(curDay);
        }

        public override bool CanWork(DateTime curDay)
        {
            if (IsVacation(curDay)) return false;

            if (curDay.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday)
            {
                DateTime prevDay = curDay.AddDays(-1);
                DateTime nextDay = curDay.AddDays(1);
                if (WorkDays.Contains(prevDay) || WorkDays.Contains(nextDay))
                    return false;
            }
            else // Weekday
            {
                DateTime nextDay = curDay.AddDays(1);
                DateTime prevDay = curDay.AddDays(-1);
                
                if (WorkDays.Contains(nextDay) && nextDay.DayOfWeek == DayOfWeek.Saturday)
                    return false;
                
                if (WorkDays.Contains(prevDay) && prevDay.DayOfWeek == DayOfWeek.Sunday)
                    return false;
            }
            
            return true;
        }

        public DateTime LastWorkDay() => WorkDays.Count > 0 ? WorkDays.Max() : new DateTime(1, 1, 1);
        public DateTime FirstWorkDay() => WorkDays.Count > 0 ? WorkDays.Min() : new DateTime(9999, 12, 31);

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
    }
}