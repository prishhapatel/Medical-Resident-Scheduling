using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MedicalDemo.Data;
using MedicalDemo.Data.Models;
using System;

namespace MedicalDemo.Controllers
{
    public class UpdateStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }

    [ApiController]
    [Route("api/[controller]")]
    public class VacationsController : ControllerBase
    {
        private readonly MedicalContext _context;

        public VacationsController(MedicalContext context)
        {
            _context = context;
        }

		// POST: api/vacations
        [HttpPost]
        public async Task<IActionResult> CreateVacation([FromBody] Vacations vacation)
        {
            if (vacation == null)
            {
                return BadRequest("Vacation object is null.");
            }

            // Validate required fields
            if (string.IsNullOrWhiteSpace(vacation.ResidentId) || vacation.Date == default || string.IsNullOrWhiteSpace(vacation.Reason) || string.IsNullOrWhiteSpace(vacation.Status))
            {
                return BadRequest("Missing required fields: ResidentId, Date, Reason, and Status are required.");
            }

            // Check if resident exists
            var residentExists = await _context.residents.AnyAsync(r => r.resident_id == vacation.ResidentId);
            if (!residentExists)
            {
                return BadRequest($"Resident with id '{vacation.ResidentId}' does not exist.");
            }

            // Generate a new Guid if not supplied
            if (vacation.VacationId == Guid.Empty)
            {
                vacation.VacationId = Guid.NewGuid();
            }

            _context.vacations.Add(vacation);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(FilterVacations), new { id = vacation.VacationId }, vacation);
        }

        // GET: api/vacations
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VacationWithResidentDto>>> GetAllVacations()
        {
            var vacations = await _context.vacations
                .Join(_context.residents,
                    v => v.ResidentId,
                    r => r.resident_id,
                    (v, r) => new VacationWithResidentDto
                    {
                        VacationId = v.VacationId,
                        ResidentId = r.resident_id,
                        FirstName = r.first_name,
                        LastName = r.last_name,
                        Date = v.Date,
                        Reason = v.Reason,
                        Status = v.Status,
                        Details = v.Details,
                        GroupId = v.GroupId
                    })
                .ToListAsync();

            return Ok(vacations);
        }

// PUT: api/vacations/group/{groupId}/status
[HttpPut("group/{groupId}/status")]
public async Task<IActionResult> UpdateStatusByGroup(string groupId, [FromBody] UpdateStatusDto input)
{
    Console.WriteLine("Received groupId: " + groupId);

    if (string.IsNullOrWhiteSpace(input.Status))
            {
                return BadRequest("Status is required.");
            }

    var matchingRequests = await _context.vacations
        .Where(v => v.GroupId == groupId)
        .ToListAsync();

    if (!matchingRequests.Any())
    {
        return NotFound($"No vacation requests found for groupId '{groupId}'.");
    }

    foreach (var request in matchingRequests)
    {
        request.Status = input.Status;
    }

    await _context.SaveChangesAsync();

    return Ok(new { message = $"Status updated to '{input.Status}' for groupId '{groupId}'." });
}



        // GET: api/vacations/filter?residentId=&date=&reason=&status=
        [HttpGet("filter")]
        public async Task<ActionResult<IEnumerable<VacationWithResidentDto>>> FilterVacations(
            [FromQuery] string? residentId,
            [FromQuery] DateTime? date,
			[FromQuery] string? reason,
            [FromQuery] string? status)
        {
           var query = _context.vacations
    .Join(_context.residents,
        v => v.ResidentId,
        r => r.resident_id,
        (v, r) => new VacationWithResidentDto
        {
            VacationId = v.VacationId,
            ResidentId = v.ResidentId,
            FirstName = r.first_name,
            LastName = r.last_name,
            Date = v.Date,
            Reason = v.Reason,
            Status = v.Status,
            Details = v.Details,
            GroupId = v.GroupId 
        });

if (!string.IsNullOrEmpty(residentId))
    query = query.Where(v => v.ResidentId == residentId);

if (date.HasValue)
    query = query.Where(v => v.Date.Date == date.Value.Date);

if (!string.IsNullOrEmpty(reason))
    query = query.Where(v => v.Reason == reason);

if (!string.IsNullOrEmpty(status))
    query = query.Where(v => v.Status == status);

var results = await query.ToListAsync();

if (results.Count == 0)
    return NotFound("No matching vacation records found.");

return Ok(results);

        }

		// PUT: api/vacations/{id}
		[HttpPut("{id}")]
		public async Task<IActionResult> UpdateVacation(Guid id, [FromBody] Vacations updatedVacation)
		{
    		if (id != updatedVacation.VacationId)
    		{
        		return BadRequest("Vacation ID in URL and body do not match.");
    		}

    		var existingVacation = await _context.vacations.FindAsync(id);

    		if (existingVacation == null)
        		return NotFound("Vacation not found.");

    		// Update the fields
    		existingVacation.ResidentId = updatedVacation.ResidentId;
    		existingVacation.Date = updatedVacation.Date;
			existingVacation.Reason = updatedVacation.Reason;
    		existingVacation.Status = updatedVacation.Status;

		    try
		    {
			    await _context.SaveChangesAsync();
			    return Ok(existingVacation); // returns updated object
		    }
		    catch (DbUpdateException ex)
		    {
			    return StatusCode(500, $"An error occurred while updating the date: {ex.Message}");
		    }
		}

		// DELETE: api/vacations/{id}
		[HttpDelete("{id}")]
		public async Task<IActionResult> DeleteVacation(Guid id)
		{
    		var vacation = await _context.vacations.FindAsync(id);

    		if (vacation == null)
    		{
        		return NotFound("Vacation not found.");
    		}

    		_context.vacations.Remove(vacation);
    		await _context.SaveChangesAsync();

    		return NoContent(); // 204 No Content
		}
    }
}