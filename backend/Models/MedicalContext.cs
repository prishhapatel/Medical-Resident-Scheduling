using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System;
using MedicalDemo.Data.Models;


namespace MedicalDemo.Data.Models
{
    public class MedicalContext : DbContext
    {
        public DbSet<Admins> admins { get; set; }
        public DbSet<Announcements> announcements { get; set; }
        public DbSet<Residents> residents { get; set; }
        public DbSet<Rotations> rotations { get; set; }
        public DbSet<Dates> dates { get; set; }
        public DbSet<Schedules> schedules { get; set; }
        public DbSet<Blackouts> blackouts { get; set; }
        public DbSet<Vacations> vacations { get; set; }
		public DbSet<Invitation> Invitations { get; set; }
		public DbSet<SwapRequest> SwapRequests { get; set; }


		public MedicalContext(DbContextOptions options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			// Map AnnouncementId as binary(16)
			modelBuilder.Entity<Announcements>()
				.Property(s => s.AnnouncementId)
				.HasColumnType("binary(16)");
			
			// Map SwapId as binary(16)
			modelBuilder.Entity<SwapRequest>()
				.Property(s => s.SwapId)
				.HasColumnType("binary(16)");
			
			// Map ScheduleSwapId as binary(16)
			modelBuilder.Entity<SwapRequest>()
				.Property(s => s.ScheduleSwapId)
				.HasColumnType("binary(16)");
			
			// Create Timestamps for the swap requests on creation
			modelBuilder.Entity<SwapRequest>()
				.Property(b => b.CreatedAt)
				.HasDefaultValueSql("CURRENT_TIMESTAMP");

			// Create Timestamps for the swap requests on creation/update
			modelBuilder.Entity<SwapRequest>()
				.Property(b => b.UpdatedAt)
				.HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
			
			// Map BlackoutId as binary(16)
			modelBuilder.Entity<Blackouts>()
				.Property(s => s.BlackoutId)
				.HasColumnType("binary(16)");
		
			// Map DateId as binary(16)
			modelBuilder.Entity<Dates>()
				.Property(s => s.DateId)
				.HasColumnType("binary(16)");
			
			// Map ScheduleId in Dates as binary(16)
			modelBuilder.Entity<Dates>()
    			.Property(d => d.ScheduleId)
    			.HasColumnType("binary(16)");
			
			// Map RotationId as binary(16)
    		modelBuilder.Entity<Rotations>()
        		.Property(s => s.RotationId)
        		.HasColumnType("binary(16)");

			// Map ScheduleId as binary(16)
    		modelBuilder.Entity<Schedules>()
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
