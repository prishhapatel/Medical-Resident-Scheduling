using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MedicalDemo.Data;
using MedicalDemo.Data.Models;
using System;

namespace MedicalDemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RotationsController : ControllerBase
    {
        private readonly MedicalContext _context;

        public RotationsController(MedicalContext context)
        {
            _context = context;
        }

        // GET: api/rotations
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Rotations>>> GetAllRotations()
        {
            return await _context.rotations.ToListAsync();
        }

        // GET: api/rotations/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Rotations>> GetRotationById(Guid id)
        {
            var rotation = await _context.rotations.FindAsync(id);

            if (rotation == null)
            {
                return NotFound();
            }

            return rotation;
        }

        // DELETE: api/rotations/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRotationById(Guid id)
        {
            var rotation = await _context.rotations.FindAsync(id);

            if (rotation == null)
            {
                return NotFound();
            }

            _context.rotations.Remove(rotation);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
