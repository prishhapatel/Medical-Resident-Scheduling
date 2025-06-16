using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MedicalDemo.Data;
using MedicalDemo.Data.Models;
using System;

namespace MedicalDemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BlackoutsController : ControllerBase
    {
        private readonly MedicalContext _context;

        public BlackoutsController(MedicalContext context)
        {
            _context = context;
        }

		// POST: api/blackouts
		[HttpPost]
		public async Task<IActionResult> CreateBlackout([FromBody] Blackouts blackout)
		{
    		if (blackout == null)
    		{
        		return BadRequest("Blackout object is null.");
    		}

    		if (blackout.BlackoutId == Guid.Empty)
    		{
        		blackout.BlackoutId = Guid.NewGuid();
    		}

    		_context.blackouts.Add(blackout);
		    await _context.SaveChangesAsync();
	
    		return CreatedAtAction(nameof(FilterBlackouts), new { id = blackout.BlackoutId }, blackout);
		}

        // GET: api/blackouts
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Blackouts>>> GetBlackouts()
        {
            return await _context.blackouts.ToListAsync();
        }
		
		// GET: api/blackouts/filter?resident_id=&date
        [HttpGet("filter")]
		public async Task<ActionResult<IEnumerable<Blackouts>>> FilterBlackouts(
    		[FromQuery] string? resident_id,
    		[FromQuery] DateTime? date)
		{
    		var query = _context.blackouts.AsQueryable();

    		if (!string.IsNullOrEmpty(resident_id))
        		query = query.Where(b => b.ResidentId == resident_id);

    		if (date.HasValue)
		        query = query.Where(b => b.Date.Date == date.Value.Date);
		
    		var results = await query.ToListAsync();

    		if (!results.Any())
        		return NotFound("No blackouts matched the filter criteria.");

    		return Ok(results);
		}

		// PUT: api/blackouts/{id}
		[HttpPut("{id}")]
		public async Task<IActionResult> UpdateBlackout(Guid id, [FromBody] Blackouts updatedBlackout)
		{
    		if (id != updatedBlackout.BlackoutId)
    		{
        		return BadRequest("Blackout ID in URL and body do not match.");
    		}

    		var existingBlackout = await _context.blackouts.FindAsync(id);
    		if (existingBlackout == null)
    		{
        		return NotFound("Blackout not found.");
    		}

    		// Update fields
    		existingBlackout.ResidentId = updatedBlackout.ResidentId;
    		existingBlackout.Date = updatedBlackout.Date;

    		try
			{
				await _context.SaveChangesAsync();
				return Ok(existingBlackout); // returns updated object
			}
    		catch (DbUpdateException ex)
    		{
        		return StatusCode(500, $"An error occurred while updating the date: {ex.Message}");
    		}
		}

		// DELETE: api/blackouts/{id}
		[HttpDelete("{id}")]
		public async Task<IActionResult> DeleteBlackout(Guid id)
		{
    		var blackout = await _context.blackouts.FindAsync(id);
    		if (blackout == null)
    		{
        		return NotFound("Blackout not found.");
    		}

    		_context.blackouts.Remove(blackout);
    		await _context.SaveChangesAsync();

    		return NoContent(); // 204
		}
    }
}
