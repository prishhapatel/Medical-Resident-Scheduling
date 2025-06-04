using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System;

namespace MedicalDemo.Data.Models
{
    public class MedicalContext : DbContext
    {
        public DbSet<Admins> admins { get; set; }
        public DbSet<Resident> residents { get; set; }
        public DbSet<Rotations> rotations { get; set; }
        public DbSet<Date> dates { get; set; }
        public DbSet<Schedule> schedules { get; set; }
        public DbSet<Blackout> blackouts { get; set; }
        public DbSet<Vacations> vacations { get; set; }

        public MedicalContext(DbContextOptions options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
		{

    		// Map ScheduleId as binary(16)
    		modelBuilder.Entity<Schedule>()
        		.Property(s => s.ScheduleId)
        		.HasColumnType("binary(16)");

			// This will correctly tell EF Core to map VacationId to binary(16)
    		modelBuilder.Entity<Vacations>()
        		.Property(v => v.VacationId)
        		.HasColumnType("binary(16)");

    		base.OnModelCreating(modelBuilder);
		}
    }
}
