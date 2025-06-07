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

		// GET: api/residents/filter?residentID=&firstName=&lastName=&graduateYr=2&email=&password=&phoneNum=&weeklyHours=&totalHours=&biYearlyHours
		[HttpGet("filter")]
		public async Task<ActionResult<IEnumerable<Resident>>> FilterResidents(
    		[FromQuery] string? residentId,
    		[FromQuery] string? firstName,
    		[FromQuery] string? lastName,
    		[FromQuery] int? graduateYr,
    		[FromQuery] string? email,
    		[FromQuery] string? password,
    		[FromQuery] string? phoneNum,
    		[FromQuery] int? weeklyHours,
    		[FromQuery] int? totalHours,
    		[FromQuery] int? biYearlyHours)
		{
    		var query = _context.residents.AsQueryable();

    		if (!string.IsNullOrEmpty(residentId))
        		query = query.Where(r => r.ResidentId == residentId);

    		if (!string.IsNullOrEmpty(firstName))
        		query = query.Where(r => r.FirstName.Contains(firstName));

    		if (!string.IsNullOrEmpty(lastName))
        		query = query.Where(r => r.LastName.Contains(lastName));

    		if (graduateYr.HasValue)
        		query = query.Where(r => r.GraduateYr == graduateYr.Value);

    		if (!string.IsNullOrEmpty(email))
        		query = query.Where(r => r.Email.Contains(email));

    		if (!string.IsNullOrEmpty(password))
        		query = query.Where(r => r.Password == password); // Consider hashing or not exposing this

    		if (!string.IsNullOrEmpty(phoneNum))
        		query = query.Where(r => r.PhoneNum.Contains(phoneNum));

    		if (weeklyHours.HasValue)
        		query = query.Where(r => r.WeeklyHours == weeklyHours.Value);

    		if (totalHours.HasValue)
        		query = query.Where(r => r.TotalHours == totalHours.Value);

    		if (biYearlyHours.HasValue)
        		query = query.Where(r => r.BiYearlyHours == biYearlyHours.Value);

    		var results = await query.ToListAsync();

    		if (!results.Any())
        		return NotFound("No residents matched the filter criteria.");

    		return Ok(results);
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

            return CreatedAtAction(nameof(GetResidents), new { id = resident.ResidentId }, resident);
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
