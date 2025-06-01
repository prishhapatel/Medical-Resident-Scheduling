using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;

namespace MedicalDemo.Data.Models
{
    // Adjust the namespace to match your actual structure
    public class MedicalContextFactory : IDesignTimeDbContextFactory<MedicalContext>
    {
        public MedicalContext CreateDbContext(string[] args)
        {
            // Get the environment
            var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";

            // Build configuration
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json")
                .AddJsonFile($"appsettings.{environment}.json", optional: true)
                .Build();

            // Get connection string
            var connectionString = configuration.GetConnectionString("MySqlConn");

            // Create options builder
            var builder = new DbContextOptionsBuilder<MedicalContext>();
            builder.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));

            // 3. Return a new instance of your DbContext
            return new MedicalContext(builder.Options);
        }
    }
}
