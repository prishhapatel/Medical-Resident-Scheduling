using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MedicalDemo.Data.Models;  // Adjust namespace based on your project
using System.Threading.Tasks;

namespace MedicalDemo.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ResidentsController : ControllerBase
    {
        private readonly MedicalContext _context;

        public ResidentsController(MedicalContext context)
        {
            _context = context;
        }

        // GET: api/Residents
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Residents>>> GetResidents()
        {
            return await _context.residents.ToListAsync();
        }

        // GET: api/residents/filter?resident_id=&first__name=&last_name=&graduate_yr=2&email=&password=&phone_num=&weekly_hours=&total_hours=&bi_yearly_hours
        [HttpGet("filter")]
        public async Task<ActionResult<IEnumerable<Residents>>> FilterResidents(
            [FromQuery] string? resident_id,
            [FromQuery] string? first_name,
            [FromQuery] string? last_name,
            [FromQuery] int? graduate_yr,
            [FromQuery] string? email,
            [FromQuery] string? password,
            [FromQuery] string? phone_num,
            [FromQuery] int? weekly_hours,
            [FromQuery] int? total_hours,
            [FromQuery] int? bi_yearly_hours)
        {
            var query = _context.residents.AsQueryable();

            if (!string.IsNullOrEmpty(resident_id))
                query = query.Where(r => r.resident_id == resident_id);

            if (!string.IsNullOrEmpty(first_name))
                query = query.Where(r => r.first_name.Contains(first_name));

            if (!string.IsNullOrEmpty(last_name))
                query = query.Where(r => r.last_name.Contains(last_name));

            if (graduate_yr is not null)
                query = query.Where(r => r.graduate_yr == graduate_yr);

            if (!string.IsNullOrEmpty(email))
                query = query.Where(r => r.email.Contains(email));

            if (!string.IsNullOrEmpty(password))
                query = query.Where(r => r.password == password); // Consider not exposing password filters

            if (!string.IsNullOrEmpty(phone_num))
                query = query.Where(r => r.phone_num.Contains(phone_num));

            if (weekly_hours is not null)
                query = query.Where(r => r.weekly_hours == weekly_hours);

            if (total_hours is not null)
                query = query.Where(r => r.total_hours == total_hours);

            if (bi_yearly_hours is not null)
                query = query.Where(r => r.bi_yearly_hours == bi_yearly_hours);

            var results = await query.ToListAsync();

            if (!results.Any())
                return NotFound("No residents matched the filter criteria.");

            return Ok(results);
        }


        
        // PUT: api/Residents/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutResident(string id, Residents resident)
        {
            if (id != resident.resident_id)
            {
                return BadRequest();
            }

            _context.Entry(resident).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ResidentExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Residents
        [HttpPost]
        public async Task<ActionResult<Residents>> PostResident(Residents resident)
        {
            _context.residents.Add(resident);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetResident", new { id = resident.resident_id }, resident);
        }

        // DELETE: api/Residents/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteResident(string id)
        {
            var resident = await _context.residents.FindAsync(id);
            if (resident == null)
            {
                return NotFound();
            }

            _context.residents.Remove(resident);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ResidentExists(string id)
        {
            return _context.residents.Any(e => e.resident_id == id);
        }
    }
}
