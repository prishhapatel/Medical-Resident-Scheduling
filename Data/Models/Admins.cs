using System.ComponentModel.DataAnnotations;

namespace MedicalDemo.Data.Models
{
    public class Admins
    {
        [Key]
        public string admin_id { get; set; }

        // Or, if it's truly a raw 16-byte array, you can do:
        // public byte[] AdminId { get; set; }

        public string first_name { get; set; }
        public string last_name { get; set; }
        public string email { get; set; }
        public string phone_num { get; set; }
    }
}
