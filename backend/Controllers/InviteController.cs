using Microsoft.AspNetCore.Mvc;
using MedicalDemo.Data.Models;
using MedicalDemo.Services;
using Microsoft.EntityFrameworkCore;

namespace MedicalDemo.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InviteController : ControllerBase{
        private readonly MedicalContext _context;
        private readonly PostmarkService _postmark;

        public InviteController(MedicalContext context, PostmarkService postmark){
            _context = context;
            _postmark = postmark;
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendInvitation([FromBody] InviteRequest request){
            //Check if the email exists already
            var resident = await _context.residents
                .FirstOrDefaultAsync(r => r.email == request.Email);

            //Create token and expiration time
            var token = Guid.NewGuid().ToString();
            var expires = DateTime.UtcNow.AddHours(24);

            //Save token to Invitations table
            var invitation = new Invitation{
                token = token,
                resident_id = resident?.resident_id,
                expires = expires,
                used = false
            };

            _context.Invitations.Add(invitation);
            await _context.SaveChangesAsync();

            //Build link based on whether resident was found or not
            string url;
            if (resident != null)
            {
                url = $"https://psycall.net/register?token={token}";
            }
            else
            {
                url = $"https://psycall.net/register-new?token={token}&email={Uri.EscapeDataString(request.Email)}";
            }


            //Send email
            var success = await _postmark.SendInvitationEmailAsync(request.Email, url);

            if(!success){
                return StatusCode(500, new { success = false, message = "Email sending failed." });
            }

            return Ok(new { success = true });
        }

    }

    public class InviteRequest{
        public string Email { get; set; }
    }

}
