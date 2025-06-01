using Microsoft.AspNetCore.Mvc;
using MedicalDemo.Data.Models; // Ensure this includes MedicalContext and Resident
using BCrypt.Net;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace MedicalDemo.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly MedicalContext _context;

        public AuthController(MedicalContext context)
        {
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] Resident resident)
        {
            // Check if email already exists
            var exists = await _context.residents
                .AnyAsync(r => r.Email == resident.Email);

            if (exists)
            {
                return Conflict(new { success = false, message = "Email already registered" });
            }

            // Hash the password
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(resident.Password);

            // Create new Resident instance
            var newResident = new Resident
            {
                ResidentId = resident.ResidentId,
                FirstName = resident.FirstName,
                LastName = resident.LastName,
                Email = resident.Email,
                Password = hashedPassword,
                PhoneNum = resident.PhoneNum,
                GraduateYr = resident.GraduateYr,
                WeeklyHours = 0,
                TotalHours = 0,
                BiYearlyHours = 0
            };

            _context.residents.Add(newResident);
            await _context.SaveChangesAsync();

            return StatusCode(201, new { success = true });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var resident = await _context.residents
                .FirstOrDefaultAsync(r => r.Email == request.Email);

            if (resident == null)
            {
                return Unauthorized(new { success = false, message = "Invalid credentials" });
            }

            bool passwordMatch = BCrypt.Net.BCrypt.Verify(request.Password, resident.Password);

            if (!passwordMatch)
            {
                return Unauthorized(new { success = false, message = "Invalid credentials" });
            }

            return Ok(new { success = true });
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
