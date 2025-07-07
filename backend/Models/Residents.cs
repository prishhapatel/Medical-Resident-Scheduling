using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MedicalDemo.Data.Models
{
    public class Residents
    {
        [Key]
        [Column("resident_id")]
        public string resident_id { get; set; } 

        [Column("first_name")]
        public string first_name { get; set; }

        [Column("last_name")]
        public string last_name { get; set; }

        [Column("graduate_yr")]
        public int graduate_yr { get; set; }

        [Column("email")]
        public string email { get; set; }

        [Column("password")]
        public string password { get; set; }

        [Column("phone_num")]
        public string phone_num { get; set; }

        [Column("weekly_hours")]
        public int weekly_hours { get; set; }

        [Column("total_hours")]
        public int total_hours { get; set; }

        [Column("bi_yearly_hours")]
        public int bi_yearly_hours { get; set; }
    }
}
