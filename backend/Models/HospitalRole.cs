using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MedicalDemo.Data.Models
{
    public class HospitalRole
    {
        public bool doesShort { get; set; }
        public bool doesLong { get; set; }
        public bool flexShort { get; set; }
        public bool flexLong { get; set; }
    }
}
