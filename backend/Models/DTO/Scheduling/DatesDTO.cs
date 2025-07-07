namespace MedicalDemo.Models.DTO.Scheduling
{
    public class DatesDTO
    {
        public Guid DateId { get; set; }
        public Guid ScheduleId { get; set; }
        public string ResidentId { get; set; }
        public DateTime Date { get; set; }
        public string CallType { get; set; }
        public bool IsCommitted { get; set; }
    }
}