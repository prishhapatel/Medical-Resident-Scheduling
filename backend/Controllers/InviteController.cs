using Microsoft.AspNetCore.Mvc;
using MedicalDemo.Data.Models;
using MedicalDemo.Services;
using Microsoft.EntityFrameworkCore;

namespace MedicalDemo.Server.Controllers
{//Base url and class for controller
    [ApiController]
    [Route("api/[controller]")]
    public class InviteController : ControllerBase
    {
        private readonly MedicalContext _context;
        private readonly PostmarkService _postmark;

        public InviteController(MedicalContext context, PostmarkService postmark)//Make queries to PM
        {
            _context = context;
            _postmark = postmark;
        }

        [HttpPost("send")]//api/invite/send
        public async Task<IActionResult> SendInvitation([FromBody] InviteRequest request)
        {
            var token = Guid.NewGuid().ToString();
            var expires = DateTime.UtcNow.AddHours(48); //two days from now

            //Save to database
            var invitation = new Invitation
            {
                token = token,
                resident_id = request.ResidentId,
                expires = expires,
                used = false
            };

            _context.Invitations.Add(invitation);
            await _context.SaveChangesAsync();

            //Send the email
            var success = await _postmark.SendInvitationEmailAsync(request.Email, $"{request.FirstName} {request.LastName}", token);

            if(!success)
            {
                return StatusCode(500, new { success = false, message = "Email sending failed." });
            }

            return Ok(new { success = true });
        }
    }

    public class InviteRequest
    {
        public string ResidentId{ get; set; }
        public string FirstName{ get; set; }
        public string LastName{ get; set; }
        public string Email{ get; set; }
    }
}
