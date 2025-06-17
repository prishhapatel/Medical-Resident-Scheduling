using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MedicalDemo.Data.Models
{
    [Table("dates")]
    public class Dates
    {
        [Key]
        [Column("date_id")]
        public Guid DateId { get; set; }  // binary(16) typically maps to Guid in EF Core

        [Column("schedule_id")]
        public Guid ScheduleId { get; set; }

        [Column("resident_id")]
        [MaxLength(15)]
        public string ResidentId { get; set; }

        [Column("date")]
        public DateTime Date { get; set; }

        [Column("call_type")]
        [MaxLength(45)]
        public string CallType { get; set; }
    }
}