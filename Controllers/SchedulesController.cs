using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MedicalDemo.Data.Models;  // Adjust namespace based on your project

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

        // GET: api/Admins
        [HttpGet]
        public IActionResult GetSchedules()
        {
            var schedules = _context.schedules.ToList();  // 
            return Ok(schedules);
        }

        // GET: api/Admins/5
        [HttpGet("{schedule_id}")]
        public IActionResult GetScheduleByScheduleId(string schedule_id)
        {
            var schedule = _context.schedules.Find(schedule_id);
            if (schedule == null) return NotFound();
            return Ok(schedule);
        }

        // DELETE: api/Admins/5
        [HttpDelete("{schedule_id}")]
        public IActionResult DeleteSchedule(string schedule_id)
        {
            var schedule = _context.schedules.Find(schedule_id);
            if (schedule == null)
                return NotFound();

            _context.schedules.Remove(schedule);
            _context.SaveChanges();

            return NoContent();
        }



    }
}
