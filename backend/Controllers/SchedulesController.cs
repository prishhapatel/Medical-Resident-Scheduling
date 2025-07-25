using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MedicalDemo.Data.Models;
using MedicalDemo.Data.Models.DTOs; // Adjust namespace based on your project

namespace MedicalDemo.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class SchedulesController : ControllerBase
    {

        private readonly MedicalContext _context;

        public SchedulesController(MedicalContext context)
        {
            _context = context;
        }

		// POST: api/schedules
		[HttpPost]
		public async Task<IActionResult> CreateSchedule([FromBody] Schedules schedule)
		{
    		if (schedule == null)
    		{
        		return BadRequest("Schedule object is null.");
    		}

    		if (schedule.ScheduleId == Guid.Empty)
    		{
        		schedule.ScheduleId = Guid.NewGuid();
    		}

    		_context.schedules.Add(schedule);
    		await _context.SaveChangesAsync();

    		return CreatedAtAction(nameof(GetAllSchedules), new { id = schedule.ScheduleId }, schedule);
		}

        // GET: api/schedules
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Schedules>>> GetAllSchedules()
        {
            var schedules = await _context.schedules.ToListAsync();
            return Ok(schedules);
        }
        
        // GET: api/schedules/filter?status=
        [HttpGet("filter")]
        public async Task<ActionResult<IEnumerable<Schedules>>> FilterSchedules(
	        [FromQuery] string? status)
        {
	        var query = _context.schedules.AsQueryable();

	        if (!string.IsNullOrWhiteSpace(status))
		        query = query.Where(s => s.Status == status);

	        var results = await query.ToListAsync();

	        if (results.Count == 0)
		        return NotFound("No matching schedule records found.");

	        return Ok(results);
        }
        
        // GET: api/schedules/published-dates
        [HttpGet("published-dates")]
        public async Task<ActionResult<IEnumerable<ScheduleDatesDTO>>> GetPublishedDates()
        {
	        var publishedDates = await (
		        from d in _context.dates
		        join s in _context.schedules on d.ScheduleId equals s.ScheduleId
		        where s.Status.ToLower() == "published"
		        select new ScheduleDatesDTO
		        {
			        Date = d.Date,
			        ResidentId = d.ResidentId,
			        CallType = d.CallType
		        }).ToListAsync();

	        if (!publishedDates.Any())
		        return NotFound("No dates found for published schedules.");

	        return Ok(publishedDates);
        }
        
        // GET: api/schedules/under-review-dates
        [HttpGet("under-review-dates")]
        public async Task<ActionResult<IEnumerable<ScheduleDatesDTO>>> GetUnderReviewDates()
        {
	        var underReviewDates = await (
		        from d in _context.dates
		        join s in _context.schedules on d.ScheduleId equals s.ScheduleId
		        where s.Status.ToLower() == "under review"
		        select new ScheduleDatesDTO
		        {
			        Date = d.Date,
			        ResidentId = d.ResidentId,
			        CallType = d.CallType
		        }).ToListAsync();

	        if (!underReviewDates.Any())
		        return NotFound("No dates found for schedules under review.");

	        return Ok(underReviewDates);
        }


        // PUT: api/schedules/{id}
		[HttpPut("{id}")]
		public async Task<IActionResult> UpdateSchedule(Guid id, [FromBody] Schedules updatedSchedule)
		{
    		if (id != updatedSchedule.ScheduleId)
    		{
        		return BadRequest("Schedule ID in URL and body do not match.");
    		}

    		var existingSchedule = await _context.schedules.FindAsync(id);

    		if (existingSchedule == null)
        		return NotFound("Schedule not found.");

    		existingSchedule.Status = updatedSchedule.Status;

    		try
			{
				await _context.SaveChangesAsync();
				return Ok(existingSchedule); // returns updated object
			}
    		catch (DbUpdateException ex)
    		{
        		return StatusCode(500, $"An error occurred while updating the date: {ex.Message}");
    		}
		}

		// DELETE: api/schedules/{id}
		[HttpDelete("{id}")]
		public async Task<IActionResult> DeleteSchedule(Guid id)
		{
    		var schedule = await _context.schedules.FindAsync(id);

    		if (schedule == null)
    		{
        		return NotFound("Schedule not found.");
    		}

    		_context.schedules.Remove(schedule);
    		await _context.SaveChangesAsync();

    		return NoContent(); // 204 No Content
		}
    }
}
