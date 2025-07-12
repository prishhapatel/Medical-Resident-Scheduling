using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MedicalDemo.Data.Models
{
    [Table("vacations")]
    public class Vacations
    {
        [Key]
        [Column("vacation_id")]
        public Guid VacationId { get; set; }  // binary(16) typically maps to Guid in EF Core

        [Column("resident_id")]
        [MaxLength(15)]
        public string ResidentId { get; set; }

        [Column("date")]
        public DateTime Date { get; set; }

        [Column("reason")]
        [MaxLength(45)]
        public string Reason { get; set; }

        [Column("status")]
        [MaxLength(45)]
        public string Status { get; set; }

        [Column("details")]
        [MaxLength(255)]
        public string? Details { get; set; }

    }
}