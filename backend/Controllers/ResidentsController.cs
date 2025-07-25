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

        // GET: api/residents/filter?resident_id=&first_name=&last_name=&graduate_yr=2&email=&password=&phone_num=&weekly_hours=&total_hours=&bi_yearly_hours
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


        
        // PUT: api/residents/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateResident(string id, [FromBody] Residents updatedResident)
        {
            if (id != updatedResident.resident_id)
            {
                return BadRequest("Resident ID in URL and body do not match.");
            }

            var existingResident = await _context.residents.FindAsync(id);
            if (existingResident == null)
            {
                return NotFound("Resident not found.");
            }

            // Update fields
            existingResident.first_name = updatedResident.first_name;
            existingResident.last_name = updatedResident.last_name;
            existingResident.graduate_yr = updatedResident.graduate_yr;
            existingResident.email = updatedResident.email;
            existingResident.password = updatedResident.password;
            existingResident.phone_num = updatedResident.phone_num;
            existingResident.weekly_hours = updatedResident.weekly_hours;
            existingResident.total_hours = updatedResident.total_hours;
            existingResident.bi_yearly_hours = updatedResident.bi_yearly_hours;

            try
            {
                await _context.SaveChangesAsync();
                return Ok(existingResident); // returns the updated resident object
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"An error occurred while updating the resident: {ex.Message}");
            }
        }

        // POST: api/Residents/demote-admin/{adminId}
        [HttpPost("demote-admin/{adminId}")]
        public async Task<IActionResult> DemoteAdminToResident(string adminId)
        {
            var admin = await _context.admins.FindAsync(adminId);
            if (admin == null)
            {
                return NotFound("Admin not found.");
            }

            // Check if resident already exists with this ID
            var existingResident = await _context.residents.FindAsync(adminId);
            if (existingResident != null)
            {
                return BadRequest("Resident already exists with this ID.");
            }

            // Create new resident account with default values
            var newResident = new Residents
            {
                resident_id = admin.admin_id,
                first_name = admin.first_name,
                last_name = admin.last_name,
                email = admin.email,
                password = admin.password,
                phone_num = admin.phone_num,
                graduate_yr = 1, // Default PGY level
                weekly_hours = 0,
                total_hours = 0,
                bi_yearly_hours = 0
            };

            // Add resident and remove admin
            _context.residents.Add(newResident);
            _context.admins.Remove(admin);

            try
            {
                await _context.SaveChangesAsync();
                return Ok(newResident);
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"An error occurred while demoting admin: {ex.Message}");
            }
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
