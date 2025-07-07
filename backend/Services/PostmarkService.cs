using PostmarkDotNet;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;

namespace MedicalDemo.Services{
    public class PostmarkService{
        private readonly string apiKey;
        private readonly string fromEmail;
        private readonly string fromName;
        private readonly PostmarkClient client;


        public PostmarkService(IConfiguration config){
            apiKey = config["POSTMARK_API_KEY"];
            fromEmail = config["FROM_EMAIL"];
            fromName = config["FROM_NAME"];
            client = new PostmarkClient(apiKey);

        }

        public async Task<bool> SendInvitationEmailAsync(string toEmail, string link){
            var message = new PostmarkMessage{
                From = fromEmail,
                To = toEmail,
                Subject = "Psycall Invitation to Register",
                HtmlBody = $@"
            <h3>Hello!</h3>
            <p>Admin would like you to create a Psycall account.</p>
            <p>Please click this link to complete your registration:</p>
            <a href='{link}'>{link}</a>
            <p>Thank you,<br/>Psycall Admin</p>",
                TextBody = $"Hello,\n\nAdmin would like you to create a Psycall account.\n\nPlease use the following link:\n{link}\n\nThank you,\nPsycall Admin"
            };

            var response = await client.SendMessageAsync(message);
            return response.Status == PostmarkStatus.Success;
        }


    }
}
