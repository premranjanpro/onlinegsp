using System;
using System.IO;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Http;

namespace OnlineGspApp.Controllers
{
    [RoutePrefix("api/upload")]
    public class Base64UploadController : ApiController
    {
        [HttpPost, Route("base64")]
        public IHttpActionResult UploadBase64([FromBody] Base64UploadRequest req)
        {
            if (req == null || string.IsNullOrWhiteSpace(req.Data))
                return BadRequest("Invalid payload");

            try
            {
                var root = HttpContext.Current.Server.MapPath("~/Uploads");
                if (!Directory.Exists(root)) Directory.CreateDirectory(root);

                var data = req.Data;
                var m = Regex.Match(data, @"data:(?<type>.+?);base64,(?<base>.+)");
                string base64;

                // VS 2013 compatible extension logic
                string ext = "";
                var extFromFile = Path.GetExtension(req.Filename ?? "");
                if (!string.IsNullOrEmpty(extFromFile))
                {
                    ext = extFromFile.Replace(".", "");
                }

                if (m.Success)
                {
                    base64 = m.Groups["base"].Value;
                    var mime = m.Groups["type"].Value;

                    if (string.IsNullOrEmpty(ext))
                    {
                        if (mime.Contains("png")) ext = "png";
                        else if (mime.Contains("jpeg") || mime.Contains("jpg")) ext = "jpg";
                        else if (mime.Contains("gif")) ext = "gif";
                        else ext = "bin";
                    }
                }
                else
                {
                    base64 = data;
                }

                var safeName = Path.GetFileNameWithoutExtension(req.Filename ?? "file") ?? "file";

                // VS 2013 compatible string.Format
                var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
                var newName = string.Format("{0}_{1}.{2}", safeName, timestamp, ext);

                var dest = Path.Combine(root, newName);

                var bytes = Convert.FromBase64String(base64);
                File.WriteAllBytes(dest, bytes);

                var relative = "/Uploads/" + newName;
                return Ok(new { path = relative });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }
    }

    public class Base64UploadRequest
    {
        public string Filename { get; set; }
        public string Data { get; set; }
    }
}
