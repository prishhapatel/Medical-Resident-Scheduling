namespace MedicalDemo.Models.DTO.Scheduling
{
    public class PGY1DTO : ResidentDTO
    {
        public DateTime LastTrainingDate { get; set; }

        public override bool CanWork(DateTime curDay)
        {
            if (IsVacation(curDay)) return false;

            int monthIndex = (curDay.Month + 5) % 12;
            var role = RolePerMonth[monthIndex];

            if (role == null)
            {
                Console.WriteLine($"[DEBUG] {Name} has null role for {curDay:MM/dd/yyyy} (index={monthIndex})");
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
            
            if (curDay <= LastTrainingDate) 
                return false;

            return true;
        }

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