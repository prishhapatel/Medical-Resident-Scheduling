using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MedicalDemo.Data.Models
{
    public class PGY
    {
        public string Name { get; set; }

        public HospitalRole[] RolePerMonth { get; set; }

        // Use List<DateTime> instead of ArrayList for type safety
        public List<DateTime> VacationRequests { get; set; }
        public List<DateTime> AllWorkDates { get; set; } 
        public int HoursWorked6Months { get; set; }
        public int HoursWorkedTotal { get; set; }
        public int InTraining { get; set; }
    }
}
