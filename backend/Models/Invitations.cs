using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MedicalDemo.Data.Models
{
    [Table("invitations")]
    public class Invitation
    {
        [Key]
        [Column("token")]
        public string token{ get; set; }

        [Column("resident_id")]
        public string? resident_id{ get; set; }

        [Column("expires")]
        public DateTime expires{ get; set; }

        [Column("used")]
        public bool used{ get; set; }
    }
}
