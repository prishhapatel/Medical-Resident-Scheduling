using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Design;

namespace MedicalDemo.Data.Models
{

    public class MedicalContext : DbContext
    {
        public DbSet<Admins> admins { get; set; }

        public DbSet<Resident> residents { get; set; }

        public DbSet<Rotations> rotations { get; set; }

        public DbSet<Date> dates { get; set; }

        public DbSet<Schedule> schedules{ get; set; }



        public MedicalContext(DbContextOptions options) : base(options)
        {


        }

    }
}
