using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace MedicalDemo.Data.Models
{
    public class Schedule
    {

        [Key]

        public Guid schedule_id { get; set; }
        public string status { get; set; }


    }
}
