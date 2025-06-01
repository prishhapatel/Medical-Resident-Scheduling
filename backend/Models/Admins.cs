using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MedicalDemo.Data.Models
{
    public class Admins
    {
        [Key]
        [Column("admin_id")]
        public string admin_id { get; set; }

        // Or, if it's truly a raw 16-byte array, you can do:
        // public byte[] AdminId { get; set; }

        [Column("first_name")]
        public string first_name { get; set; }

        [Column("last_name")]
        public string last_name { get; set; }

        [Column("email")]
        public string email { get; set; }

        [Column("phone_num")]
        public string phone_num { get; set; }
    }
}
