using MedicalDemo.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using MedicalDemo.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace MedicalDemo.Controllers
{
    [ApiController]
    [Route("api/algorithm")]
    public class ScheduleController : ControllerBase
    {
        private readonly SchedulerService _schedulerService;
        private readonly MedicalContext _context;

        // ✅ Combine both dependencies into one constructor
        public ScheduleController(MedicalContext context, SchedulerService schedulerService)
        {
            _context = context;
            _schedulerService = schedulerService;
        }

        [HttpPost("training/{year}")]
        public async Task<IActionResult> GenerateFullSchedule(int year)
        {
            if (year < DateTime.Now.Year)
                return BadRequest(new { success = false, error = "Year must be the current year or later." });

            // Delete existing schedules to ensure only one schedule is in the database at all times
            var existingSchedules = await _context.schedules.ToListAsync();
            _context.schedules.RemoveRange(existingSchedules);
            await _context.SaveChangesAsync();
            
            // Generate the new schedule
            var (success, error) = await _schedulerService.GenerateFullSchedule(year);
            if (!success)
                return StatusCode(500, new { success = false, error });

            return Ok(new { success = true, message = "Schedule generated and saved successfully." });
        }
    }
}