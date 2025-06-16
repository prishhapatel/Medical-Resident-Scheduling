using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MedicalDemo.Data.Models
{
    [Table("blackouts")]
    public class Blackouts
    {
        [Key]
        [Column("blackout_id")]
        public Guid BlackoutId { get; set; }  // binary(16)

        [Column("resident_id")]
        [MaxLength(15)]
        public string ResidentId { get; set; }

        [Column("date")]
        public DateTime Date { get; set; }
    }
}
