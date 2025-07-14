using MedicalDemo.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace MedicalDemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AlgorithmController : ControllerBase
    {
        private readonly SchedulerService _scheduler;

        public AlgorithmController(SchedulerService scheduler)
        {
            _scheduler = scheduler;
        }

        [HttpPost("training/{year}")]
        public async Task<IActionResult> GenerateTrainingSchedule(int year)
        {
            try
            {
                // Validate year input
                if (year < DateTime.Now.Year - 1)
                {
                    return BadRequest(new {
                        Success = false,
                        Message = "Invalid year value. Please provide a valid year."
                    });
                }

                // Execute scheduling algorithm
                await _scheduler.GenerateTrainingSchedule(year);

                return Ok(new { 
                    Success = true,
                    Message = $"Training schedule for {year} generated successfully",
                    GeneratedAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new {
                    Success = false,
                    Message = "Scheduling failed",
                    Error = ex.Message,
                    StackTrace = ex.StackTrace  // Remove in production
                });
            }
        }
    }
}