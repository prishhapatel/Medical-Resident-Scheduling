using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MedicalDemo.Data;
using MedicalDemo.Data.Models;
using MedicalDemo.Data.Models.DTOs;
using System;

namespace MedicalDemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DatesController : ControllerBase
    {
        private readonly MedicalContext _context;

        public DatesController(MedicalContext context)
        {
            _context = context;
        }

		// POST: api/dates
		[HttpPost]
		public async Task<IActionResult> CreateDate([FromBody] Dates date)
		{
    		if (date == null)
    		{
        		return BadRequest("Date object is null.");
    		}

    		if (date.DateId == Guid.Empty)
    		{
        		date.DateId = Guid.NewGuid();
    		}

    		_context.dates.Add(date);
    		await _context.SaveChangesAsync();

    		return CreatedAtAction(nameof(FilterDates), new { id = date.DateId }, date);
		}

        // GET: api/dates
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DatesWithResidentDTO>>> GetDates()
        {
	        var dates = await _context.dates
		        .Include(d => d.Resident) // Join with Residents
		        .Select(d => new DatesWithResidentDTO
		        {
			        DateId = d.DateId,
			        ScheduleId = d.ScheduleId,
			        ResidentId = d.ResidentId,
			        FirstName = d.Resident.first_name,
			        LastName = d.Resident.last_name,
			        Date = d.Date,
			        CallType = d.CallType
		        })
		        .ToListAsync();

	        return Ok(dates);
        }

		// GET: api/dates/filter?schedule_id=&resident_id=&date=&call_type
		[HttpGet("filter")]
		public async Task<ActionResult<IEnumerable<DatesWithResidentDTO>>> FilterDates(
			[FromQuery] Guid? schedule_id,
			[FromQuery] string? resident_id,
			[FromQuery] DateTime? date,
			[FromQuery] string? call_type)
		{
			var query = _context.dates.Include(d => d.Resident).AsQueryable();

			if (schedule_id is not null)
				query = query.Where(d => d.ScheduleId == schedule_id);

			if (!string.IsNullOrEmpty(resident_id))
				query = query.Where(d => d.ResidentId == resident_id);

			if (date is not null)
				query = query.Where(d => d.Date.Date == date.Value.Date);

			if (!string.IsNullOrEmpty(call_type))
				query = query.Where(d => d.CallType.Contains(call_type));

			var results = await query
				.Select(d => new DatesWithResidentDTO
				{
					DateId = d.DateId,
					ScheduleId = d.ScheduleId,
					ResidentId = d.ResidentId,
					FirstName = d.Resident.first_name,
					LastName = d.Resident.last_name,
					Date = d.Date,
					CallType = d.CallType
				})
				.ToListAsync();

			if (!results.Any())
				return NotFound("No dates matched the filter criteria.");

			return Ok(results);
		}

		// PUT: api/dates/{id}
		[HttpPut("{id}")]
		public async Task<IActionResult> UpdateDate(Guid id, [FromBody] Dates updatedDate)
		{
    		if (id != updatedDate.DateId)
    		{
        		return BadRequest("Date ID in URL and body do not match.");
    		}

    		var existingDate = await _context.dates.FindAsync(id);
    		if (existingDate == null)
    		{
        		return NotFound("Date not found.");
    		}

    		// Update fields
    		existingDate.ScheduleId = updatedDate.ScheduleId;
    		existingDate.ResidentId = updatedDate.ResidentId;
    		existingDate.Date = updatedDate.Date;
		    existingDate.CallType = updatedDate.CallType;
	
		    try
			{
				await _context.SaveChangesAsync();
				return Ok(existingDate); // returns updated object
			}
    		catch (DbUpdateException ex)
    		{
        		return StatusCode(500, $"An error occurred while updating the date: {ex.Message}");
    		}
		}

		// DELETE: api/dates/{id}
		[HttpDelete("{id}")]
		public async Task<IActionResult> DeleteDate(Guid id)
		{
    		var existingDate = await _context.dates.FindAsync(id);
    		if (existingDate == null)
    		{
        		return NotFound("Date not found.");
    		}

    		_context.dates.Remove(existingDate);
    		await _context.SaveChangesAsync();

    		return NoContent(); // 204
		}
    }
}
