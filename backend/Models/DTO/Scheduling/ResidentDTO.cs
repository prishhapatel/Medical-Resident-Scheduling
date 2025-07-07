namespace MedicalDemo.Models.DTO.Scheduling
{
    public abstract class ResidentDTO
    {
        public string ResidentId { get; set; }
        public string Name { get; set; }
        public bool InTraining { get; set; }
        public HashSet<DateTime> VacationRequests { get; set; } = new HashSet<DateTime>();
        public HashSet<DateTime> WorkDays { get; set; } = new HashSet<DateTime>();
        public HashSet<DateTime> CommitedWorkDays { get; set; } = new HashSet<DateTime>();
        
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
    }
}