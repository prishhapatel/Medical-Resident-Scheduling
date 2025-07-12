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
            if (swapRequest == null)
                return BadRequest("SwapRequest object is null.");

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
    }
}
