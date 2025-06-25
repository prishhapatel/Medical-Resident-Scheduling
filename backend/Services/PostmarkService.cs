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

        public async Task<bool> SendInvitationEmailAsync(string toEmail, string toName, string token)
        {
            var client = new PostmarkClient(_apiKey);

            var message = new PostmarkMessage
            {
                From = _fromEmail,
                To = toEmail,
                Subject = "You're invited to join PSYCALL",
                HtmlBody = $"<h3>Hello {toName},</h3><p>Please <a href='http://localhost:3000/register?token={token}'>click here to complete your registration</a>.</p>",
                TextBody = $"Hello {toName},\n\nPlease use the following link to complete registration:\nhttp://localhost:3000/register?token={token}"
            };

            Console.WriteLine($"Sending FROM: {_fromEmail} TO: {toEmail}");
            Console.WriteLine($"Loaded FROM_EMAIL: {_fromEmail}");


            var response = await client.SendMessageAsync(message);

            Console.WriteLine($"Postmark status: {response.Status}");
            Console.WriteLine($"Postmark message: {response.Message}");

            return response.Status == PostmarkStatus.Success;
        }
    }
}
