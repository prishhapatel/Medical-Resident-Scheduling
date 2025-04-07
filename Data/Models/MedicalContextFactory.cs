using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using System;

namespace MedicalDemo.Data.Models
{
    // Adjust the namespace to match your actual structure
    public class MedicalContextFactory : IDesignTimeDbContextFactory<MedicalContext>
    {
        public MedicalContext CreateDbContext(string[] args)
        {
            // 1. Create the builder
            var builder = new DbContextOptionsBuilder<MedicalContext>();

            // 2. Configure your connection (hard-coded or from config)
            builder.UseMySql(
                "server=135.148.149.147;port=3306;database=sd1;user=developer;password=G13Scheduling;",
                new MySqlServerVersion(new Version(8, 0, 3)) // or your actual MySQL version
            );

            // 3. Return a new instance of your DbContext
            return new MedicalContext(builder.Options);
        }
    }
}
