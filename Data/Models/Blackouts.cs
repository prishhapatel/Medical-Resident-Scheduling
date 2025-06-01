using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace MedicalDemo.Data.Models
{
    public class Blackout
    {

        [Key]

        public Guid blackout_id { get; set; }

        public string resident_id { get; set; }

        public DateTime date { get; set; }



    }
}
