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

        [HttpPost("complete")]
        public async Task<IActionResult> CompleteRegistration([FromBody] RegisterRequest request)
        {
            if (string.IsNullOrEmpty(request.Token) || string.IsNullOrEmpty(request.Phone) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new { message = "Missing required fields." });
            }

            var invitation = await _context.Invitations
                .FirstOrDefaultAsync(i => i.token == request.Token && !i.used && i.expires > DateTime.UtcNow);

            if (invitation == null)
            {
                return NotFound(new { message = "Invalid or expired invitation." });
            }

            if (string.IsNullOrEmpty(invitation.resident_id))
            {
                return BadRequest(new { message = "Resident ID not linked to invitation. Use register-new instead." });
            }

            var resident = await _context.residents.FirstOrDefaultAsync(r => r.resident_id == invitation.resident_id);
            if (resident == null)
            {
                return NotFound(new { message = "Resident not found." });
            }

            resident.phone_num = request.Phone;
            resident.password = HashPassword(request.Password);
            invitation.used = true;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Registration complete." });
        }

        [HttpPost("new")]
        public async Task<IActionResult> RegisterNewResident([FromBody] RegisterNewRequest request)
        {
            if (string.IsNullOrEmpty(request.Token) ||
                string.IsNullOrEmpty(request.Email) ||
                string.IsNullOrEmpty(request.FirstName) ||
                string.IsNullOrEmpty(request.LastName) ||
                string.IsNullOrEmpty(request.ResidentId) ||
                string.IsNullOrEmpty(request.Phone) ||
                string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new { message = "Missing required fields." });
            }

            var invitation = await _context.Invitations
                .FirstOrDefaultAsync(i => i.token == request.Token && !i.used && i.expires > DateTime.UtcNow);

            if (invitation == null)
            {
                return NotFound(new { message = "Invalid or expired invitation." });
            }

            var existingResident = await _context.residents.FirstOrDefaultAsync(r => r.email == request.Email);
            if (existingResident != null)
            {
                return BadRequest(new { message = "A resident with this email already exists." });
            }

            var newResident = new Residents
            {
                resident_id = request.ResidentId,
                first_name = request.FirstName,
                last_name = request.LastName,
                email = request.Email,
                phone_num = request.Phone,
                password = HashPassword(request.Password),
                graduate_yr = 1,
                weekly_hours = 0,
                total_hours = 0,
                bi_yearly_hours = 0
            };

            _context.residents.Add(newResident);
            invitation.used = true;

            await _context.SaveChangesAsync();

            return Ok(new { message = "New resident registered successfully." });
        }

        public class RegisterNewRequest
        {
            public string Token { get; set; }
            public string? Email { get; set; }
            public string FirstName { get; set; }
            public string LastName { get; set; }
            public string ResidentId { get; set; }
            public string Phone { get; set; }
            public string Password { get; set; }
        }

        private string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        public class RegisterRequest
        {
            public string Token { get; set; }
            public string Phone { get; set; }
            public string Password { get; set; }
        }

    }
}
