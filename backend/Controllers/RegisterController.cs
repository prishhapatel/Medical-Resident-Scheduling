using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MedicalDemo.Data.Models;

namespace MedicalDemo.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RegisterController : ControllerBase
    {
        private readonly MedicalContext _context;

        public RegisterController(MedicalContext context)
        {
            _context = context;
        }

        [HttpGet("info")]
        public async Task<IActionResult> GetInviteInfo([FromQuery] string token)
        {
            if (string.IsNullOrEmpty(token))
            {
                return BadRequest(new { message = "Token is required." });
            }

            var invitation = await _context.Invitations
                .FirstOrDefaultAsync(i => i.token == token && !i.used && i.expires > DateTime.UtcNow);

            if (invitation == null)
            {
                return NotFound(new { message = "Invitation not found or expired." });
            }

            var resident = !string.IsNullOrEmpty(invitation.resident_id)
                ? await _context.residents.FirstOrDefaultAsync(r => r.resident_id == invitation.resident_id)
                : null;

            return Ok(new
            {
                hasEmailOnFile = resident != null,
                resident = resident == null ? null : new
                {
                    firstName = resident.first_name,
                    lastName = resident.last_name,
                    residentId = resident.resident_id,
                    email = resident.email
                }
            });
        }
    }
}
