using OnlineGspApp.Helpers;
using OnlineGspApp.Models;
using OnlineGspApp.Security;
using System;
using System.IO;
using System.Web;
using System.Web.Http;

namespace OnlineGspApp.Controllers
{
    [RoutePrefix("api/upload")]
    public class UploadController : ApiController
    {

        [HttpGet, Route("")]
        public IHttpActionResult GetAll()
        {
            return Ok("working");
        }

        // Generic endpoint: POST /api/upload/base64
        // body: { filename: "abc.jpg", data: "data:image/jpeg;base64,....", folder: "members" }
        [HttpPost, Route("baseupload")]
        [ApiKey]
        public IHttpActionResult UploadBase64([FromBody] UploadRequest req)
        {
            if (req == null || string.IsNullOrWhiteSpace(req.Filename) || string.IsNullOrWhiteSpace(req.Data))
                return BadRequest("filename and data required");

            try
            {
                var folderName = string.IsNullOrWhiteSpace(req.Folder) ? "common" : req.Folder.Trim();

                // VS2013 friendly MapPath (no string interpolation)
                var uploadsDir = System.Web.Hosting.HostingEnvironment.MapPath("~/uploads/" + folderName + "/");
                if (!Directory.Exists(uploadsDir)) Directory.CreateDirectory(uploadsDir);

                var data = req.Data;
                var comma = data.IndexOf(',');
                if (comma >= 0) data = data.Substring(comma + 1);

                var bytes = Convert.FromBase64String(data);
                var ext = Path.GetExtension(req.Filename);
                if (string.IsNullOrWhiteSpace(ext)) ext = ".jpg";

                // safeName without interpolation
                var safeName = Guid.NewGuid().ToString("N") + ext;
                var savePath = Path.Combine(uploadsDir, safeName);
                File.WriteAllBytes(savePath, bytes);

                // VS2013 friendly VirtualPathUtility call
                var relativePath = VirtualPathUtility.ToAbsolute("~/uploads/" + folderName + "/" + safeName);
                return Ok(new { path = relativePath });
            }
            catch (FormatException)
            {
                return BadRequest("Invalid base64 data");
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        public class UploadRequest
        {
            public string Filename { get; set; }
            public string Data { get; set; }
            public string Folder { get; set; } // e.g., "members", "courses", "news"
        }
    }
}
