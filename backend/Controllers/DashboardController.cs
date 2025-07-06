using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MedicalDemo.Data.Models;
using System;
using System.Threading.Tasks;

namespace MedicalDemo.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly MedicalContext _context;

        public DashboardController(MedicalContext context)
        {
            _context = context;
        }

        // GET: api/dashboard/resident/{residentId}
        [HttpGet("resident/{residentId}")]
        public async Task<ActionResult<DashboardData>> GetDashboardData(string residentId)
        {
            try
            {
                var dashboardData = new DashboardData
                {
                    ResidentId = residentId,
                    CurrentRotation = "No rotation assigned",
                    RotationEndDate = "",
                    MonthlyHours = 0,
                    UpcomingShifts = new List<UpcomingShift>(),
                    RecentActivity = new List<RecentActivity>(),
                    TeamUpdates = new List<TeamUpdate>()
                };

                // Get current rotation
                var currentMonth = DateTime.Now.ToString("MMMM yyyy");
                var currentRotation = await _context.rotations
                    .FirstOrDefaultAsync(r => r.ResidentId == residentId && r.Month == currentMonth);

                if (currentRotation != null)
                {
                    dashboardData.CurrentRotation = currentRotation.Rotation;
                    var endOfMonth = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1).AddMonths(1).AddDays(-1);
                    dashboardData.RotationEndDate = $"Ends {endOfMonth:MM/dd/yyyy}";
                }

                // Get dates for this resident
                var userDates = await _context.dates
                    .Where(d => d.ResidentId == residentId)
                    .ToListAsync();

                // Calculate this month's hours
                var thisMonthDates = userDates.Where(d => 
                    d.Date.Month == DateTime.Now.Month && 
                    d.Date.Year == DateTime.Now.Year).ToList();
                dashboardData.MonthlyHours = thisMonthDates.Count * 8; // Assuming 8 hours per shift

                // Get upcoming shifts (next 3)
                var futureDates = userDates
                    .Where(d => d.Date >= DateTime.Today)
                    .OrderBy(d => d.Date)
                    .Take(3)
                    .ToList();

                dashboardData.UpcomingShifts = futureDates.Select(d => new UpcomingShift
                {
                    Date = d.Date.ToString("MM/dd/yyyy"),
                    Type = d.CallType
                }).ToList();

                // Generate recent activity
                if (thisMonthDates.Any())
                {
                    dashboardData.RecentActivity.Add(new RecentActivity
                    {
                        Id = "1",
                        Type = "schedule",
                        Message = $"You have {thisMonthDates.Count} shifts scheduled this month",
                        Date = "Current month"
                    });
                }

                if (futureDates.Any())
                {
                    var nextShift = futureDates.First();
                    dashboardData.RecentActivity.Add(new RecentActivity
                    {
                        Id = "2",
                        Type = "upcoming",
                        Message = $"Next shift: {nextShift.CallType} on {nextShift.Date:MM/dd/yyyy}",
                        Date = "Upcoming"
                    });
                }

                // Add team updates (placeholder)
                dashboardData.TeamUpdates.Add(new TeamUpdate
                {
                    Id = "1",
                    Message = "Welcome to the Medical Resident Scheduling System!",
                    Date = "Today"
                });

                return Ok(dashboardData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while fetching dashboard data: {ex.Message}");
            }
        }
    }

    // DTOs for dashboard response
    public class DashboardData
    {
        public string ResidentId { get; set; } = "";
        public string CurrentRotation { get; set; } = "";
        public string RotationEndDate { get; set; } = "";
        public int MonthlyHours { get; set; }
        public List<UpcomingShift> UpcomingShifts { get; set; } = new();
        public List<RecentActivity> RecentActivity { get; set; } = new();
        public List<TeamUpdate> TeamUpdates { get; set; } = new();
    }

    public class UpcomingShift
    {
        public string Date { get; set; } = "";
        public string Type { get; set; } = "";
    }

    public class RecentActivity
    {
        public string Id { get; set; } = "";
        public string Type { get; set; } = "";
        public string Message { get; set; } = "";
        public string Date { get; set; } = "";
    }

    public class TeamUpdate
    {
        public string Id { get; set; } = "";
        public string Message { get; set; } = "";
        public string Date { get; set; } = "";
    }
}
