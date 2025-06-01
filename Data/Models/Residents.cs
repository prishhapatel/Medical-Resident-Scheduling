using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MedicalDemo.Data.Models
{
    // Optional: If your table is named "residents" (plural) and you want to ensure EF 
    // maps this class to exactly that table name, add the [Table] attribute:
    // [Table("residents")]
    public class Resident
    {
        [Key]
        [Column("resident_id")] // Maps to varchar(15) PK
        public string ResidentId { get; set; }

        [Column("first_name")]
        public string FirstName { get; set; }

        [Column("last_name")]
        public string LastName { get; set; }

        [Column("graduate_yr")]
        public int GraduateYr { get; set; }

        [Column("email")]
        public string Email { get; set; }

        [Column("password")]
        public string Password { get; set; }

        [Column("phone_num")]
        public string PhoneNum { get; set; }

        [Column("weekly_hours")]
        public int WeeklyHours { get; set; }

        [Column("total_hours")]
        public int TotalHours { get; set; }

        // If the actual column name has a space (e.g. "bi yearly hours"), do this:
        [Column("bi_yearly_hours")]
        public int BiYearlyHours { get; set; }
    }
}
