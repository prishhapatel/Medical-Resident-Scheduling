﻿using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MedicalDemo.Data.Models;  // Adjust namespace based on your project
using MedicalDemo.Repositories; // Add this for IMedicalRepository

namespace MedicalDemo.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class SchedulesController : ControllerBase
    {

        private readonly MedicalContext _context;
        private readonly IMedicalRepository _repo;

        public SchedulesController(MedicalContext context, IMedicalRepository repo)
        {
            _context = context;
            _repo = repo;
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

        // POST: api/schedules/generate
        [HttpPost("generate")]
        public async Task<IActionResult> GenerateNewSchedule()
        {
            // Generate the training schedule dates
            var trainingDates = await _repo.GenerateTrainingScheduleAsync();

            // Create a new schedule
            var newSchedule = new Schedules
            {
                ScheduleId = Guid.NewGuid(),
                Status = "Under review"
            };
            _context.schedules.Add(newSchedule);
            await _context.SaveChangesAsync();

            // Insert the schedule dates into the database
            foreach (var date in trainingDates)
            {
                if (!string.IsNullOrWhiteSpace(date.ResidentId))
                {
                    // If ResidentId contains multiple IDs separated by commas, split them
                    var residentIds = date.ResidentId.Split(',', StringSplitOptions.RemoveEmptyEntries);

                    foreach (var residentId in residentIds)
                    {
                        var trimmedResidentId = residentId.Trim();
                        var entry = new Dates
                        {
                            DateId = Guid.NewGuid(),
                            ScheduleId = newSchedule.ScheduleId,
                            ResidentId = trimmedResidentId,
                            Date = date.Date,
                            CallType = date.CallType
                        };
                        _context.dates.Add(entry);
                    }
                }
            }
            await _context.SaveChangesAsync();

            return Ok(new { scheduleId = newSchedule.ScheduleId });
        }
    }
}
