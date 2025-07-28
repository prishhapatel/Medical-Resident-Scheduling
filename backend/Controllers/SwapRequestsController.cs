using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MedicalDemo.Data;
using MedicalDemo.Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MedicalDemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SwapRequestsController : ControllerBase
    {
        private readonly MedicalContext _context;

        public SwapRequestsController(MedicalContext context)
        {
            _context = context;
        }
        
        
        // POST: api/swaprequests
        [HttpPost]
        public async Task<IActionResult> CreateSwapRequest([FromBody] SwapRequest swapRequest)
        {
            // Console.WriteLine("Received swap request: " + System.Text.Json.JsonSerializer.Serialize(swapRequest));

            if (swapRequest == null) {
                // Console.WriteLine("SwapRequest object is null.");
                return BadRequest("SwapRequest object is null.");
            }

            // Console.WriteLine($"swapRequest.RequesterId: {swapRequest.RequesterId}, swapRequest.RequesterDate: {swapRequest.RequesterDate:yyyy-MM-dd}");
            // Console.WriteLine($"swapRequest.RequesteeId: {swapRequest.RequesteeId}, swapRequest.RequesteeDate: {swapRequest.RequesteeDate:yyyy-MM-dd}");

            // Fetch residents
            var requester = await _context.residents.FirstOrDefaultAsync(r => r.resident_id == swapRequest.RequesterId);
            var requestee = await _context.residents.FirstOrDefaultAsync(r => r.resident_id == swapRequest.RequesteeId);
            // Console.WriteLine($"Requester: {requester?.resident_id}, PGY: {requester?.graduate_yr}; Requestee: {requestee?.resident_id}, PGY: {requestee?.graduate_yr}");
            if (requester == null || requestee == null) {
                // Console.WriteLine("Requester or requestee not found.");
                return BadRequest("Requester or requestee not found.");
            }

            // Check PGY (graduate_yr)
            if (requester.graduate_yr != requestee.graduate_yr) {
                // Console.WriteLine($"PGY mismatch: {requester.graduate_yr} vs {requestee.graduate_yr}");
                return BadRequest("Both residents must be the same PGY level to swap.");
            }

            // Fetch dates
            var requesterDate = await _context.dates.FirstOrDefaultAsync(d => d.ResidentId == swapRequest.RequesterId && d.Date.Date == swapRequest.RequesterDate.Date);
            var requesteeDate = await _context.dates.FirstOrDefaultAsync(d => d.ResidentId == swapRequest.RequesteeId && d.Date.Date == swapRequest.RequesteeDate.Date);
            // Console.WriteLine($"DB Query for requester: ResidentId={swapRequest.RequesterId}, Date={swapRequest.RequesterDate:yyyy-MM-dd} => Found: {(requesterDate != null ? "Yes" : "No")}");
            // Console.WriteLine($"DB Query for requestee: ResidentId={swapRequest.RequesteeId}, Date={swapRequest.RequesteeDate:yyyy-MM-dd} => Found: {(requesteeDate != null ? "Yes" : "No")}");
            if (requesterDate == null || requesteeDate == null) {
                // Console.WriteLine("Could not find both shift dates for the swap.");
                return BadRequest("Could not find both shift dates for the swap.");
            }

            // Check shift type
            if (!AreEquivalentCallTypes(requesterDate.CallType, requesteeDate.CallType))
            {
                // Console.WriteLine($"Shift type mismatch: {requesterDate.CallType} vs {requesteeDate.CallType}");
                return BadRequest("Both shifts must be the same type (e.g., Sunday with Sunday, Saturday with Saturday, Short with Short).");
            }
                
            if (swapRequest.SwapId == Guid.Empty)
                swapRequest.SwapId = Guid.NewGuid();

            swapRequest.CreatedAt = DateTime.UtcNow;
            swapRequest.UpdatedAt = DateTime.UtcNow;

            _context.SwapRequests.Add(swapRequest);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(FilterSwapRequests), new { id = swapRequest.SwapId }, swapRequest);
        }

        // GET: api/swaprequests
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SwapRequest>>> GetSwapRequests()
        {
            var swapRequests = await _context.SwapRequests.ToListAsync();
            return Ok(swapRequests);
        }

        // GET: api/swaprequests/filter?schedule_swap_id=&requester_id=&requestee_id=&status
        [HttpGet("filter")]
        public async Task<ActionResult<IEnumerable<SwapRequest>>> FilterSwapRequests(
            [FromQuery] Guid? schedule_swap_id,
            [FromQuery] string? requester_id,
            [FromQuery] string? requestee_id,
            [FromQuery] string? status)
        {
            var query = _context.SwapRequests.AsQueryable();

            if (schedule_swap_id.HasValue)
                query = query.Where(s => s.ScheduleSwapId == schedule_swap_id.Value);

            if (!string.IsNullOrEmpty(requester_id))
                query = query.Where(s => s.RequesterId == requester_id);

            if (!string.IsNullOrEmpty(requestee_id))
                query = query.Where(s => s.RequesteeId == requestee_id);

            if (!string.IsNullOrEmpty(status))
                query = query.Where(s => s.Status.Contains(status));

            var results = await query.ToListAsync();

            if (!results.Any())
                return NotFound("No swap requests matched the filter criteria.");

            return Ok(results);
        }

        // PUT: api/swaprequests/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSwapRequest(Guid id, [FromBody] SwapRequest updatedRequest)
        {
            if (id != updatedRequest.SwapId)
                return BadRequest("ID in URL and body do not match.");

            var existing = await _context.SwapRequests.FindAsync(id);
            if (existing == null)
                return NotFound("SwapRequest not found.");

            // Update fields
            existing.ScheduleSwapId = updatedRequest.ScheduleSwapId;
            existing.RequesterId = updatedRequest.RequesterId;
            existing.RequesteeId = updatedRequest.RequesteeId;
            existing.RequesterDate = updatedRequest.RequesterDate;
            existing.RequesteeDate = updatedRequest.RequesteeDate;
            existing.Status = updatedRequest.Status;
            existing.Details = updatedRequest.Details;
            existing.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
                return Ok(existing);
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"An error occurred while updating the swap request: {ex.Message}");
            }
        }

        // DELETE: api/swaprequests/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSwapRequest(Guid id)
        {
            var existing = await _context.SwapRequests.FindAsync(id);
            if (existing == null)
                return NotFound("SwapRequest not found.");

            _context.SwapRequests.Remove(existing);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/swaprequests/{id}/approve
        [HttpPost("{id}/approve")]
        public async Task<IActionResult> ApproveSwapRequest(Guid id)
        {
            var swap = await _context.SwapRequests.FindAsync(id);
            if (swap == null)
                return NotFound("SwapRequest not found.");
            if (swap.Status != "Pending")
                return BadRequest("SwapRequest is not pending.");

            // Helper to match callType robustly
            bool CallTypeMatches(string a, string b)
            {
                var sundaySet = new HashSet<string> { "Sunday", "12h" };
                var saturdaySet = new HashSet<string> { "Saturday", "24h" };
                if (sundaySet.Contains(a) && saturdaySet.Contains(b)) return true;
                if (saturdaySet.Contains(a) && saturdaySet.Contains(b)) return true;
                if (a == "Short" && b == "Short") return true;
                return false;
            }

            // Fetch all candidate dates for each resident/date
            var requesterDates = await _context.dates
                .Where(d => d.ResidentId == swap.RequesterId && d.Date.Date == swap.RequesterDate.Date)
                .ToListAsync();
            var requesteeDates = await _context.dates
                .Where(d => d.ResidentId == swap.RequesteeId && d.Date.Date == swap.RequesteeDate.Date)
                .ToListAsync();

            // Find the best match in memory
            var requesterDate = requesterDates.FirstOrDefault(d => CallTypeMatches(d.CallType, swap.RequesterDate.ToString("dddd")))
                ?? requesterDates.FirstOrDefault();
            var requesteeDate = requesteeDates.FirstOrDefault(d => CallTypeMatches(d.CallType, swap.RequesteeDate.ToString("dddd")))
                ?? requesteeDates.FirstOrDefault();

            if (requesterDate == null || requesteeDate == null)
                return BadRequest("Could not find both shift dates to perform the swap.");

            // Swap the resident IDs
            var tempResidentId = requesterDate.ResidentId;
            requesterDate.ResidentId = requesteeDate.ResidentId;
            requesteeDate.ResidentId = tempResidentId;

            swap.Status = "Approved";
            swap.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Return response with swap information only
            var response = new
            {
                Message = "Swap approved and calendar updated successfully.",
                SwapId = swap.SwapId,
                RequesterId = swap.RequesterId,
                RequesteeId = swap.RequesteeId
            };
            return Ok(response);
        }

        // POST: api/swaprequests/{id}/deny
        [HttpPost("{id}/deny")]
        public async Task<IActionResult> DenySwapRequest(Guid id, [FromBody] DenySwapRequestDto dto)
        {
            var swap = await _context.SwapRequests.FindAsync(id);
            if (swap == null)
                return NotFound("SwapRequest not found.");
            if (swap.Status != "Pending")
                return BadRequest("SwapRequest is not pending.");

            swap.Status = "Denied";
            swap.Details = dto?.Reason ?? "";
            swap.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Optionally: Add logic to notify users, etc.
            // Add recent activity for requester (handled in dashboard fetch for now)

            return Ok(swap);
        }

        // Helper to compare call types
        private bool AreEquivalentCallTypes(string a, string b)
        {
            var sundayTypes = new[] { "Sunday", "12h" };
            var saturdayTypes = new[] { "Saturday", "24h" };
            if (sundayTypes.Contains(a) && sundayTypes.Contains(b)) return true;
            if (saturdayTypes.Contains(a) && saturdayTypes.Contains(b)) return true;
            return a == b;
        }

        public class DenySwapRequestDto
        {
            public string? Reason { get; set; }
        }
    }
}
