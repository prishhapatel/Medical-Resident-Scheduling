using PostmarkDotNet;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;

namespace MedicalDemo.Services
{
    public class PostmarkService
    {
        private readonly string _apiKey;
        private readonly string _fromEmail;
        private readonly string _fromName;

        public PostmarkService(IConfiguration config)
        {
            _apiKey = config["POSTMARK_API_KEY"];
            _fromEmail = config["FROM_EMAIL"];
            _fromName = config["FROM_NAME"];
        }

public async Task<bool> SendInvitationEmailAsync(string toEmail, string residentId, string token)
{
    var client = new PostmarkClient(_apiKey);

var message = new PostmarkMessage
{//Using html and text to support different platforms
    From = _fromEmail,
    To = toEmail,
    Subject = "Psycall Invitation to Register",
    HtmlBody = $@"
        <h3>Hello!</h3>
        <p>Admin at HCA North Florida would like you to create a Psycall account. Please click the link below to complete your registration using resident ID <strong>{residentId}</strong>:</p>
        <p><a href='http://localhost:3000/register?token={token}'>Complete Registration</a></p>
        <p>Thank you,<br/>Psycall Admin</p>
    ",
    TextBody = $@"
Hello!

Admin HCA North Florida would like you to create a Psycall account. Please use the following link to complete your registration using resident ID {residentId}:

http://localhost:3000/register?token={token}

Thank you,  
Psycall Admin"
};


    var response = await client.SendMessageAsync(message);

    return response.Status == PostmarkStatus.Success;
}

    }
}
