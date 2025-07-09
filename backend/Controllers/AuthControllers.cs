using Microsoft.AspNetCore.Mvc;
using MedicalDemo.Data.Models;
using BCrypt.Net;
using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace MedicalDemo.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly MedicalContext _context;

        public AuthController(MedicalContext context)
        {
            _context = context;
        }

        [HttpOptions]
        public IActionResult Options()
        {
            return Ok();
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] Residents resident)
        {
            var exists = await _context.residents
                .AnyAsync(r => r.email == resident.email);

            if (exists)
            {
                return Conflict(new { success = false, message = "Email already registered" });
            }

            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(resident.password);

            var newResident = new Residents
            {
                resident_id = resident.resident_id,
                first_name = resident.first_name,
                last_name = resident.last_name,
                email = resident.email,
                password = hashedPassword,
                phone_num = resident.phone_num,
                graduate_yr = resident.graduate_yr,
                weekly_hours = 0,
                total_hours = 0,
                bi_yearly_hours = 0
            };

            _context.residents.Add(newResident);
            await _context.SaveChangesAsync();

            return StatusCode(201, new { success = true });
        }

[HttpPost("login")]
public async Task<IActionResult> Login([FromBody] LoginRequest request)
{
    try
    {
        //check residents table first
        var resident = await _context.residents
            .FirstOrDefaultAsync(r => r.email == request.email);

        if (resident != null)
        {
            bool passwordMatch = BCrypt.Net.BCrypt.Verify(request.password, resident.password);

            if (!passwordMatch)
            {
                return Unauthorized(new { success = false, message = "Invalid credentials" });
            }

            string token = Guid.NewGuid().ToString();

            return Ok(new
            {
                success = true,
                token = token,
                userType = "resident",
                resident = new
                {
                    id = resident.resident_id,
                    email = resident.email,
                    firstName = resident.first_name,
                    lastName = resident.last_name,
                    phone_num = resident.phone_num
                }
            });
        }

        //check admins table if not found in residents
        var admin = await _context.admins
            .FirstOrDefaultAsync(a => a.email == request.email);

        if (admin != null)
        {
            bool passwordMatch = BCrypt.Net.BCrypt.Verify(request.password, admin.password);

            if (!passwordMatch)
            {
                return Unauthorized(new { success = false, message = "Invalid credentials" });
            }

            string token = Guid.NewGuid().ToString();

            return Ok(new
            {
                success = true,
                token = token,
                userType = "admin",
                admin = new
                {
                    id = admin.admin_id,
                    email = admin.email,
                    firstName = admin.first_name,
                    lastName = admin.last_name,
                    phone_num = admin.phone_num
                }
            });
        }

        //Not found in either
        return Unauthorized(new { success = false, message = "Invalid credentials" });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { success = false, message = $"Login error: {ex.Message}" });
    }
}

    }

    public class LoginRequest
    {
        public string email { get; set; }
        public string password { get; set; }
    }
}
