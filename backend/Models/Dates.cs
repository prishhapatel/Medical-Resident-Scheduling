using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;


namespace MedicalDemo.Data.Models
{
    [Table("dates")]
    public class Dates
    {
        [Key]
        [Column("date_id")]
        public Guid DateId { get; set; }

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

        [ForeignKey("ResidentId")]
        [ValidateNever] 
        public Residents Resident { get; set; }  // <-- Navigation property
    }
}