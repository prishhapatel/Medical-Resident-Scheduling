using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MedicalDemo.Data.Models
{
    [Table("schedules")]
    public class Schedules
    {
        [Key]
        [Column("schedule_id")]
        public Guid ScheduleId { get; set; }

        [Column("status")]
        [MaxLength(45)]
        public string Status { get; set; }
    }
}