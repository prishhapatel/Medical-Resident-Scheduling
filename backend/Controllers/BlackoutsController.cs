
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MedicalDemo.Data.Models;  // Adjust namespace based on your project



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


        [HttpGet]
        public IActionResult GetBlackouts()
        {
            var blackout = _context.blackouts.ToList();  // 
            return Ok(blackout);
        }

        // GET: api/blackouts/{id}
        [HttpGet("{blackout_id}")]
        public async Task<ActionResult<Blackout>> GetBlackoutByBlackoutId(string blackout_id)
        {
            var blackout = await _context.blackouts.FindAsync(blackout_id);
            if (blackout == null)
            {
                return NotFound();
            }
            return blackout;
        }
        // DELETE: api/blackout/5
        [HttpDelete("{blackout_id}")]
        public IActionResult DeleteBlackout(string blackout_id)
        {
            var blackout = _context.blackouts.Find(blackout_id);
            if (blackout == null)
                return NotFound();

            _context.blackouts.Remove(blackout);
            _context.SaveChanges();

            return NoContent();
        }


    }
}
