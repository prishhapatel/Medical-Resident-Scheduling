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
        
        public ScheduleController(SchedulerService schedulerService)
        {
            _schedulerService = schedulerService;
        }

        [HttpPost("training/{year}")]
        public async Task<IActionResult> GenerateFullSchedule(int year)
        {
            if (year < DateTime.Now.Year)
                return BadRequest(new { success = false, error = "Year must be the current year or later." });
            
            // Generate the new schedule
            var (success, error) = await _schedulerService.GenerateFullSchedule(year);
            if (!success)
                return StatusCode(500, new { success = false, error });

            return Ok(new { success = true, message = "Schedule generated and saved successfully." });
        }
    }
}