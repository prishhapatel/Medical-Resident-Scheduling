using Microsoft.AspNetCore.Mvc;
using MedicalDemo.Data.Models;  // Adjust namespace to where your MedicalContext and Admin model are defined

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
        public IActionResult GetAdmins()
        {
            var admins = _context.admins.ToList();  // 
            return Ok(admins);
        }

        // GET: api/Admins/5
        [HttpGet("{id}")]
        public IActionResult GetAdmin(string id)
        {
            var admin = _context.admins.Find(id);
            if (admin == null)
                return NotFound();
            return Ok(admin);
        }

        // POST: api/Admins
        [HttpPost]
        public IActionResult CreateAdmin([FromBody] Admins admin)
        {
            if (admin == null)
                return BadRequest();

            _context.admins.Add(admin);
            _context.SaveChanges();

            return CreatedAtAction(nameof(GetAdmin), new { id = admin.admin_id }, admin);
        }

        // PUT: api/Admins/5
        [HttpPut("{id}")]
        public IActionResult UpdateAdmin(string id, [FromBody] Admins updatedAdmin)
        {
            if (id != updatedAdmin.admin_id)
                return BadRequest();

            _context.admins.Update(updatedAdmin);
            _context.SaveChanges();

            return NoContent();
        }

        // DELETE: api/Admins/5
        [HttpDelete("{id}")]
        public IActionResult DeleteAdmin(string id)
        {
            var admin = _context.admins.Find(id);
            if (admin == null)
                return NotFound();

            _context.admins.Remove(admin);
            _context.SaveChanges();

            return NoContent();
        }
    }
}
