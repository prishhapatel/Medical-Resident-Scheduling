using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System;

namespace MedicalDemo.Data.Models.DTOs
{
    public class DatesWithResidentDTO
    {
        public Guid DateId { get; set; }
        public Guid ScheduleId { get; set; }
        public string ResidentId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime Date { get; set; }
        public string CallType { get; set; }
    }
}