using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace MedicalDemo.Models
{
    public class ResidentData
    {
        public string resident_id { get; set; }

        public string first_name { get; set; }

        public string last_name { get; set; }

        public int graduate_yr { get; set; }

        public string email { get; set; }

        public string password { get; set; }

        public string phone_num { get; set; }

        public int weekly_hours { get; set; }

        public int total_hours { get; set; }

        public int bi_yearly_hours { get; set; }

        //rotations
        public Guid RotationId { get; set; }  // binary(16) typically maps to Guid in EF Core

        public string ResidentId { get; set; }

        public string Month { get; set; }

        public string Rotation { get; set; }




    }
}
