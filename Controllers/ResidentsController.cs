using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MedicalDemo.Data.Models;  // Adjust namespace based on your project

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
        public async Task<ActionResult<IEnumerable<Resident>>> GetResidents()
        {
            return await _context.residents.ToListAsync();
        }

        // GET: api/Residents/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Resident>> GetResident(string id)
        {
            var resident = await _context.residents.FindAsync(id);
            if (resident == null)
            {
                return NotFound();
            }
            return resident;
        }

        // POST: api/Residents
        [HttpPost]
        public async Task<ActionResult<Resident>> CreateResident([FromBody] Resident resident)
        {
            if (resident == null)
            {
                return BadRequest();
            }

            _context.residents.Add(resident);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetResident), new { id = resident.ResidentId }, resident);
        }

        // PUT: api/Residents/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateResident(string id, [FromBody] Resident resident)
        {
            if (id != resident.ResidentId)
            {
                return BadRequest("Resident ID mismatch.");
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

        // DELETE: api/Residents/{id}
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
            return _context.residents.Any(e => e.ResidentId == id);
        }
    }
}
