using Microsoft.AspNetCore.Mvc;
using MedicalDemo.Data.Models;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace MedicalDemo.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminsController : ControllerBase
    {
        private readonly MedicalContext _context;

        public AdminsController(MedicalContext context)
        {
            _context = context;
        }

        // GET: api/Admins
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Admins>>> GetAdmins()
        {
            return await _context.admins.ToListAsync();
        }

        // GET: api/Admins/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Admins>> GetAdmin(string id)
        {
            var admin = await _context.admins.FindAsync(id);

            if (admin == null)
            {
                return NotFound();
            }

            return admin;
        }

        // POST: api/Admins
        [HttpPost]
        public async Task<ActionResult<Admins>> PostAdmin(Admins admin)
        {
            _context.admins.Add(admin);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetAdmin", new { id = admin.admin_id }, admin);
        }

        // PUT: api/Admins/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAdmin(string id, Admins admin)
        {
            if (id != admin.admin_id)
            {
                return BadRequest();
            }

            _context.Entry(admin).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AdminExists(id))
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

        // POST: api/Admins/promote-resident/{residentId}
        [HttpPost("promote-resident/{residentId}")]
        public async Task<IActionResult> PromoteResidentToAdmin(string residentId)
        {
            var resident = await _context.residents.FindAsync(residentId);
            if (resident == null)
            {
                return NotFound("Resident not found.");
            }

            // Check if admin already exists with this ID
            var existingAdmin = await _context.admins.FindAsync(residentId);
            if (existingAdmin != null)
            {
                return BadRequest("Admin already exists with this ID.");
            }

            // Create new admin account
            var newAdmin = new Admins
            {
                admin_id = resident.resident_id,
                first_name = resident.first_name,
                last_name = resident.last_name,
                email = resident.email,
                password = resident.password,
                phone_num = resident.phone_num
            };

            // Add admin and remove resident
            _context.admins.Add(newAdmin);
            _context.residents.Remove(resident);

            try
            {
                await _context.SaveChangesAsync();
                return Ok(newAdmin);
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"An error occurred while promoting resident: {ex.Message}");
            }
        }

        // DELETE: api/Admins/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAdmin(string id)
        {
            var admin = await _context.admins.FindAsync(id);
            if (admin == null)
            {
                return NotFound();
            }

            _context.admins.Remove(admin);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AdminExists(string id)
        {
            return _context.admins.Any(e => e.admin_id == id);
        }
    }
}
