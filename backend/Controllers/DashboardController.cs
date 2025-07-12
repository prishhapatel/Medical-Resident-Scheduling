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

                // Get current rotation - try multiple month formats
                var currentMonthFormats = new[]
                {
                    DateTime.Now.ToString("MMMM yyyy"),  // "December 2024"
                    DateTime.Now.ToString("MMM yyyy"),   // "Dec 2024"
                    DateTime.Now.ToString("yyyy-MM"),    // "2024-12"
                    DateTime.Now.ToString("MM/yyyy"),    // "12/2024"
                };

                var currentRotation = await _context.rotations
                    .FirstOrDefaultAsync(r => r.ResidentId == residentId && currentMonthFormats.Contains(r.Month));

                if (currentRotation != null)
                {
                    dashboardData.CurrentRotation = currentRotation.Rotation;
                    var endOfMonth = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1).AddMonths(1).AddDays(-1);
                    dashboardData.RotationEndDate = $"Ends {endOfMonth:MM/dd/yyyy}";
                }
                else
                {
                    // Debug: Log what month formats we're looking for
                    Console.WriteLine($"No rotation found for resident {residentId}. Looking for months: {string.Join(", ", currentMonthFormats)}");
                    
                    // Get all rotations for this resident to see what format is used
                    var allRotations = await _context.rotations
                        .Where(r => r.ResidentId == residentId)
                        .ToListAsync();
                    
                    if (allRotations.Any())
                    {
                        Console.WriteLine($"Found {allRotations.Count} rotations for resident {residentId}:");
                        foreach (var rot in allRotations)
                        {
                            Console.WriteLine($"  Month: '{rot.Month}', Rotation: '{rot.Rotation}'");
                        }
                    }
                    else
                    {
                        Console.WriteLine($"No rotations found for resident {residentId}");
                    }
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
                
                // Debug: Log the hours calculation
                Console.WriteLine($"Resident {residentId}: Found {thisMonthDates.Count} dates in {DateTime.Now:MMMM yyyy}, calculated {dashboardData.MonthlyHours} hours");
                if (thisMonthDates.Any())
                {
                    Console.WriteLine($"Dates: {string.Join(", ", thisMonthDates.Select(d => d.Date.ToString("MM/dd/yyyy")))}");
                }

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
