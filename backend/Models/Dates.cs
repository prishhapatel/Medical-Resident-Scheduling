using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace MedicalDemo.Data.Models
{
    public class Date
    {
        [Key]

        public Guid date_id { get; set; }

        public Guid schedule_id { get; set; }

        public string resident_id { get; set; }

        public DateTime date { get; set; }

        public string call_type { get; set; }



    }
}
