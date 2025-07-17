namespace MedicalDemo.Models.DTO.Scheduling
{
    public abstract class ResidentDTO
    {
        public string ResidentId { get; set; }
        public string Name { get; set; }
        public string Id { get; set; }
        public bool InTraining { get; set; }
        public HashSet<DateTime> VacationRequests { get; set; } = new HashSet<DateTime>();
        public HashSet<DateTime> WorkDays { get; set; } = new HashSet<DateTime>();
        public HashSet<DateTime> CommitedWorkDays { get; set; } = new HashSet<DateTime>();
        
        public HospitalRole[] RolePerMonth { get; set; } = new HospitalRole[12];
        
        public abstract bool CanWork(DateTime date);
        public abstract void AddWorkDay(DateTime date);
        public abstract void RemoveWorkDay(DateTime date);
        
        public bool CommitedWorkDay(DateTime curDay) => CommitedWorkDays.Contains(curDay);
        
        public void SaveWorkDays()
        {
            foreach (var day in WorkDays)
            {
                CommitedWorkDays.Add(day);
            }
        }
        
        public DateTime LastWorkDay() => WorkDays.Count > 0 ? WorkDays.Max() : new DateTime(1, 1, 1);
        public DateTime FirstWorkDay() => WorkDays.Count > 0 ? WorkDays.Min() : new DateTime(9999, 12, 31);
        
        public bool IsVacation(DateTime curDay) => VacationRequests.Contains(curDay);
        
        public bool IsWorking(DateTime curDay) => WorkDays.Contains(curDay);
    }
}