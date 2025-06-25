using Microsoft.AspNetCore.Mvc;
using MedicalDemo.Data.Models;
using BCrypt.Net;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace MedicalDemo.Server.Controllers
{//Base url and and class for the controller
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly MedicalContext _context; 

        public AuthController(MedicalContext context)//Allow to make queries to db
        {
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] Residents resident)
        {
            //Check if email already exists
            var exists = await _context.residents
                .AnyAsync(r => r.email == resident.email);

            if(exists)
            {
                return Conflict(new { success = false, message = "Email already registered" });
            }

            //Hash the password
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(resident.password);

            // Create new Resident instance
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
            //Add to db
            _context.residents.Add(newResident);
            await _context.SaveChangesAsync();

            return StatusCode(201, new {success = true});
        }

        [HttpPost("login")]//api/auth/login
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var resident = await _context.residents//search for resident email
                .FirstOrDefaultAsync(r => r.email == request.email);

            if(resident == null)
            {
                return Unauthorized(new { success = false, message = "Invalid credentials" });
            }

            bool passwordMatch = BCrypt.Net.BCrypt.Verify(request.password, resident.password);//compare to hash

            if(!passwordMatch)
            {
                return Unauthorized(new { success = false, message = "Invalid credentials" });
            }

            //Generate a token
            string token = Guid.NewGuid().ToString();

            return Ok(new { 
                success = true,
                token = token,
                resident = new {
                    id = resident.resident_id,
                    email = resident.email,
                    firstName = resident.first_name,
                    lastName = resident.last_name
                }
            });
        }
    }

    public class LoginRequest//json body for requests
    {
        public string email{ get; set; }
        public string password{ get; set; }
    }
}
