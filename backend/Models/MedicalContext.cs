using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System;
using MedicalDemo.Data.Models;


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
		public DbSet<Invitation> Invitations { get; set; }


        public MedicalContext(DbContextOptions options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
		{

    		// Map RotationId as binary(16)
    		modelBuilder.Entity<Rotations>()
        		.Property(s => s.RotationId)
        		.HasColumnType("binary(16)");

			// Map ScheduleId as binary(16)
    		modelBuilder.Entity<Schedule>()
        		.Property(s => s.ScheduleId)
        		.HasColumnType("binary(16)");

			// Map VacationId as binary(16)
    		modelBuilder.Entity<Vacations>()
        		.Property(v => v.VacationId)
        		.HasColumnType("binary(16)");

    		base.OnModelCreating(modelBuilder);
		}
    }
}
