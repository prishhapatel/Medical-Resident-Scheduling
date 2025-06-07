using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MedicalDemo.Data.Models
{
    [Table("rotations")]
    public class Rotations
    {
        [Key]
        [Column("rotation_id")]
        public Guid RotationId { get; set; }  // binary(16) typically maps to Guid in EF Core

        [Column("resident_id")]
        [MaxLength(15)]
        public string ResidentId { get; set; }

        [Column("month")]
        [MaxLength(45)]
        public string Month { get; set; }

        [Column("rotation")]
        [MaxLength(45)]
        public string Rotation { get; set; }
    }
}
