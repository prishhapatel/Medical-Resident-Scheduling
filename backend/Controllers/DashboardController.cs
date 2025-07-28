using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MedicalDemo.Data.Models;
using System;
using System.Threading.Tasks;
using System.Collections.Generic; // Added for List
using System.Linq; // Added for Where, ToList, Any, Select

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
                    // Get all rotations for this resident to see what format is used
                    var allRotations = await _context.rotations
                        .Where(r => r.ResidentId == residentId)
                        .ToListAsync();
                    
                    if (allRotations.Any())
                    {
                        // Console.WriteLine($"Found {allRotations.Count} rotations for resident {residentId}:");
                        // foreach (var rot in allRotations)
                        // {
                        //     Console.WriteLine($"  Month: '{rot.Month}', Rotation: '{rot.Rotation}'");
                        // }
                    }
                    else
                    {
                        // Console.WriteLine($"No rotations found for resident {residentId}");
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
                // Console.WriteLine($"Resident {residentId}: Found {thisMonthDates.Count} dates in {DateTime.Now:MMMM yyyy}, calculated {dashboardData.MonthlyHours} hours");
                if (thisMonthDates.Any())
                {
                    // Console.WriteLine($"Dates: {string.Join(", ", thisMonthDates.Select(d => d.Date.ToString("MM/dd/yyyy")))}");
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

                // Add pending swap requests for this resident (as requestee)
                var pendingSwaps = await _context.SwapRequests
                    .Where(s => s.RequesteeId == residentId && s.Status == "Pending")
                    .ToListAsync();
                var requesterIds = pendingSwaps.Select(s => s.RequesterId).Distinct().ToList();
                var requesterMap = await _context.residents
                    .Where(r => requesterIds.Contains(r.resident_id))
                    .ToDictionaryAsync(r => r.resident_id, r => r.first_name + " " + r.last_name);
                foreach (var swap in pendingSwaps)
                {
                    string requesterName = requesterMap.ContainsKey(swap.RequesterId) ? requesterMap[swap.RequesterId] : swap.RequesterId;
                    dashboardData.RecentActivity.Add(new RecentActivity
                    {
                        Id = swap.SwapId.ToString(),
                        Type = "swap_pending",
                        Message = $"Swap request from {requesterName} for {swap.RequesterDate:MM/dd/yyyy} (your shift: {swap.RequesteeDate:MM/dd/yyyy})",
                        Date = swap.CreatedAt.ToString("MM/dd/yyyy")
                    });
                }

                // Add swap requests where this resident is the requester and status is Approved or Denied
                var respondedSwaps = await _context.SwapRequests
                    .Where(s => s.RequesterId == residentId && (s.Status == "Approved" || s.Status == "Denied"))
                    .OrderByDescending(s => s.UpdatedAt)
                    .ToListAsync();
                // Fetch all requestee IDs for these swaps
                var requesteeIds = respondedSwaps.Select(s => s.RequesteeId).Distinct().ToList();
                var requesteeMap = await _context.residents
                    .Where(r => requesteeIds.Contains(r.resident_id))
                    .ToDictionaryAsync(r => r.resident_id, r => r.first_name + " " + r.last_name);
                foreach (var swap in respondedSwaps)
                {
                    string requesteeName = requesteeMap.ContainsKey(swap.RequesteeId) ? requesteeMap[swap.RequesteeId] : swap.RequesteeId;
                    string message = swap.Status == "Approved"
                        ? $"Your swap request for {swap.RequesterDate:MM/dd/yyyy} (with {requesteeName}) was approved."
                        : $"Your swap request for {swap.RequesterDate:MM/dd/yyyy} (with {requesteeName}) was denied. Reason: {swap.Details}";
                    dashboardData.RecentActivity.Add(new RecentActivity
                    {
                        Id = swap.SwapId.ToString(),
                        Type = swap.Status == "Approved" ? "swap_approved" : "swap_denied",
                        Message = message,
                        Date = swap.UpdatedAt.ToString("MM/dd/yyyy")
                    });
                }

                // Add swap activity for the requestee (approver) when a swap is approved
                var approvedAsRequestee = await _context.SwapRequests
                    .Where(s => s.RequesteeId == residentId && s.Status == "Approved")
                    .OrderByDescending(s => s.UpdatedAt)
                    .ToListAsync();
                var approvedRequesterIds = approvedAsRequestee.Select(s => s.RequesterId).Distinct().ToList();
                var approvedRequesterMap = await _context.residents
                    .Where(r => approvedRequesterIds.Contains(r.resident_id))
                    .ToDictionaryAsync(r => r.resident_id, r => r.first_name + " " + r.last_name);
                foreach (var swap in approvedAsRequestee)
                {
                    string requesterName = approvedRequesterMap.ContainsKey(swap.RequesterId) ? approvedRequesterMap[swap.RequesterId] : swap.RequesterId;
                    string message = $"You swapped your shift on {swap.RequesteeDate:MM/dd/yyyy} with {requesterName}.";
                    dashboardData.RecentActivity.Add(new RecentActivity
                    {
                        Id = swap.SwapId.ToString() + "-as-approver",
                        Type = "swap_approved",
                        Message = message,
                        Date = swap.UpdatedAt.ToString("MM/dd/yyyy")
                    });
                }

                // Add team updates from announcements
                var announcements = await _context.announcements
                    .OrderByDescending(a => a.CreatedAt)
                    .Take(5) // Show the 5 most recent announcements
                    .ToListAsync();

                foreach (var announcement in announcements)
                {
                    dashboardData.TeamUpdates.Add(new TeamUpdate
                    {
                        Id = announcement.AnnouncementId.ToString(),
                        Message = announcement.Message ?? "",
                        Date = announcement.CreatedAt.ToString("MM/dd/yyyy")
                    });
                }

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
