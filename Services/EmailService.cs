using System;
using System.Threading.Tasks;


namespace OnlineGspApp.Services
{
    public class EmailService
    {
        private readonly SmtpOptions _opts;

        public EmailService()
        {
            _opts = new SmtpOptions
            {
                Host = "smtp.yourserver.com",
                Port = 587,
                UseSsl = true,
                User = "your-email@domain.com",
                Password = "your-password",
                FromAddress = "no-reply@example.com",
                FromName = "GSP Institute"
            };
        }

        public async Task SendEmailAsync(string toEmail, string subject, string htmlBody, string textBody = null, string inlineLogoBase64 = null)
        {
        //    var msg = new MimeMessage();
        //    msg.From.Add(new MailboxAddress(_opts.FromName, _opts.FromAddress));
        //    msg.To.Add(MailboxAddress.Parse(toEmail));
        //    msg.Subject = subject ?? "Notification";

        //    var builder = new BodyBuilder();

        //    if (!string.IsNullOrEmpty(inlineLogoBase64))
        //    {
        //        try
        //        {
        //            var bytes = Convert.FromBase64String(inlineLogoBase64);

        //            // Add the logo as linked resource and set a valid Content-Id (no angle brackets)
        //            var lr = builder.LinkedResources.Add("logo.png", bytes);
        //            // MimeUtils.GenerateMessageId() returns something like "<...>" - remove angle brackets
        //            lr.ContentId = MimeUtils.GenerateMessageId().Trim('<', '>');

        //            // Use the sanitized ContentId in the cid: URI
        //            builder.HtmlBody = $"<img src=\"cid:{lr.ContentId}\" style=\"max-width:160px;display:block;margin-bottom:10px;\">{htmlBody}";
        //        }
        //        catch (FormatException ex)
        //        {
        //            // base64 decode failed — fallback to plain html body and consider logging ex
        //            builder.HtmlBody = htmlBody;
        //        }
        //        catch (Exception ex)
        //        {
        //            // other errors — fallback and consider logging
        //            builder.HtmlBody = htmlBody;
        //        }
        //    }
        //    else
        //    {
        //        builder.HtmlBody = htmlBody;
        //    }

        //    if (!string.IsNullOrEmpty(textBody))
        //        builder.TextBody = textBody;

        //    msg.Body = builder.ToMessageBody();

        //    var client = new SmtpClient();
        //    try
        //    {
        //        // If UseSsl true -> SslOnConnect; if false -> StartTls or Auto. Consider SecureSocketOptions.Auto
        //        var socketOption = _opts.UseSsl ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.StartTls;
        //        await client.ConnectAsync(_opts.Host, _opts.Port, socketOption);

        //        if (!string.IsNullOrEmpty(_opts.User))
        //        {
        //            await client.AuthenticateAsync(_opts.User, _opts.Password);
        //        }

        //        await client.SendAsync(msg);
        //    }
        //    finally
        //    {
        //        if (client.IsConnected)
        //            await client.DisconnectAsync(true);
        //    }
        }
    }

    public class SmtpOptions
    {
        public SmtpOptions()
        {
            // VS 2013 default values
            Port = 587;
            UseSsl = true;
        }

        public string Host { get; set; }
        public int Port { get; set; }
        public bool UseSsl { get; set; }
        public string User { get; set; }
        public string Password { get; set; }
        public string FromAddress { get; set; }
        public string FromName { get; set; }
    }

}
