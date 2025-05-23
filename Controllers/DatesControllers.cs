using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MedicalDemo.Data.Models;  // Adjust namespace based on your project

namespace MedicalDemo.Server.Controllers
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

        // GET: api/Admins
        [HttpGet]
        public IActionResult GetDates()
        {
            var dates = _context.dates.ToList();  // 
            return Ok(dates);
        }


        // GET: api/Admins/5
        [HttpGet("{date_id}")]
        public IActionResult GetDateByDateId(string date_id)
        {
            var date = _context.dates.Find(date_id);
            if (date == null)
                return NotFound();
            return Ok(date);
        }

        // POST: api/Admins
        [HttpPost]
        public IActionResult CreateDate([FromBody] Date date)
        {
            if (date == null)
                return BadRequest();

            _context.dates.Add(date);
            _context.SaveChanges();

            return CreatedAtAction(nameof(GetDates), new { id = date.date_id}, date);
        }

        // DELETE: api/Admins/5
        [HttpDelete("{date_id}")]
        public IActionResult DeleteAdmin(string date_id)
        {
            var date = _context.dates.Find(date_id);
            if (date == null)
                return NotFound();

            _context.dates.Remove(date);
            _context.SaveChanges();

            return NoContent();
        }


    }
}
