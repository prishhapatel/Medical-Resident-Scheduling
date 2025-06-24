using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MedicalDemo.Data;
using MedicalDemo.Data.Models;
using System;

namespace MedicalDemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VacationsController : ControllerBase
    {
        private readonly MedicalContext _context;

        public VacationsController(MedicalContext context)
        {
            _context = context;
        }

		// POST: api/vacations
        [HttpPost]
        public async Task<IActionResult> CreateVacation([FromBody] Vacations vacation)
        {
            if (vacation == null)
            {
                return BadRequest("Vacation object is null.");
            }

            // Generate a new Guid if not supplied
            if (vacation.VacationId == Guid.Empty)
            {
                vacation.VacationId = Guid.NewGuid();
            }

            _context.vacations.Add(vacation);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(FilterVacations), new { id = vacation.VacationId }, vacation);
        }
        
        // GET: api/vacations
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Vacations>>> GetAllVacations()
        {
	        var vacations = await _context.vacations.ToListAsync();
	        return Ok(vacations);
        }

        // GET: api/vacations/filter?residentId=&date=&reason=&status=
        [HttpGet("filter")]
        public async Task<ActionResult<IEnumerable<Vacations>>> FilterVacations(
            [FromQuery] string? residentId,
            [FromQuery] DateTime? date,
			[FromQuery] string? reason,
            [FromQuery] string? status)
        {
            var query = _context.vacations.AsQueryable();

            if (!string.IsNullOrEmpty(residentId))
            {
                query = query.Where(v => v.ResidentId == residentId);
            }

            if (date.HasValue)
            {
                query = query.Where(v => v.Date.Date == date.Value.Date);
            }

			if (!string.IsNullOrEmpty(reason))
            {
                query = query.Where(v => v.Reason == reason);
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(v => v.Status == status);
            }

            var results = await query.ToListAsync();

            if (results.Count == 0)
            {
                return NotFound("No matching vacation records found.");
            }

            return Ok(results);
        }

		// PUT: api/vacations/{id}
		[HttpPut("{id}")]
		public async Task<IActionResult> UpdateVacation(Guid id, [FromBody] Vacations updatedVacation)
		{
    		if (id != updatedVacation.VacationId)
    		{
        		return BadRequest("Vacation ID in URL and body do not match.");
    		}

    		var existingVacation = await _context.vacations.FindAsync(id);

    		if (existingVacation == null)
        		return NotFound("Vacation not found.");

    		// Update the fields
    		existingVacation.ResidentId = updatedVacation.ResidentId;
    		existingVacation.Date = updatedVacation.Date;
			existingVacation.Reason = updatedVacation.Reason;
    		existingVacation.Status = updatedVacation.Status;

		    try
		    {
			    await _context.SaveChangesAsync();
			    return Ok(existingVacation); // returns updated object
		    }
		    catch (DbUpdateException ex)
		    {
			    return StatusCode(500, $"An error occurred while updating the date: {ex.Message}");
		    }
		}

		// DELETE: api/vacations/{id}
		[HttpDelete("{id}")]
		public async Task<IActionResult> DeleteVacation(Guid id)
		{
    		var vacation = await _context.vacations.FindAsync(id);

    		if (vacation == null)
    		{
        		return NotFound("Vacation not found.");
    		}

    		_context.vacations.Remove(vacation);
    		await _context.SaveChangesAsync();

    		return NoContent(); // 204 No Content
		}
    }
}