using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Design;

namespace MedicalDemo.Data.Models
{

    public class MedicalContext : DbContext
    {
        public DbSet<Admins> admins { get; set; }

        public DbSet<Resident> residents { get; set; }

        public MedicalContext(DbContextOptions options) : base(options)
        {


        }

    }
}
