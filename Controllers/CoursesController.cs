using OnlineGspApp.Helpers;
using OnlineGspApp.Models;
using OnlineGspApp.Security;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Http;

namespace OnlineGspApp.Controllers
{
    [RoutePrefix("api/courses")]
    public class CoursesController : ApiController
    {
        private readonly string file = System.Web.Hosting.HostingEnvironment.MapPath("~/App_Data/courses.json");
        private readonly string uploadsDir = System.Web.Hosting.HostingEnvironment.MapPath("~/uploads/courses/");

        private static readonly string[] PredefinedDurations = new[] {
            "01 Month", "02 Months", "03 Months", "06 Months", "09 Months",
            "12 Months", "24 Months", "36 Months"
        };

        public CoursesController()
        {
            if (!Directory.Exists(uploadsDir)) Directory.CreateDirectory(uploadsDir);
            if (!File.Exists(file)) JsonFileStore.WriteAll(file, new List<CourseModel>());
        }

        // GET api/courses
        [HttpGet, Route("")]
        public IHttpActionResult GetAll()
        {
            var all = JsonFileStore.ReadAll<CourseModel>(file).ToList();
            all = all.OrderByDescending(x => x.CreatedAt).ToList();
            return Ok(all);
        }

        // GET api/courses/{id}
        [HttpGet, Route("{id}")]
        public IHttpActionResult GetById(string id)
        {
            var all = JsonFileStore.ReadAll<CourseModel>(file);
            var found = all.FirstOrDefault(x => string.Equals(x.Id, id, StringComparison.OrdinalIgnoreCase));
            if (found == null) return NotFound();
            return Ok(found);
        }

        // GET durations
        [HttpGet, Route("durations")]
        public IHttpActionResult GetDurations()
        {
            return Ok(PredefinedDurations);
        }

        // CREATE
        [HttpPost, Route("")]
        [ApiKey]
        public IHttpActionResult Create([FromBody] CourseModel item)
        {
            if (item == null) return BadRequest("Course payload is required.");

            if (string.IsNullOrWhiteSpace(item.Id))
                item.Id = Guid.NewGuid().ToString("N");

            var context = new ValidationContext(item, null, null);
            var validationResults = new List<ValidationResult>();
            if (!Validator.TryValidateObject(item, context, validationResults, true))
                return Content(HttpStatusCode.BadRequest, validationResults.Select(v => v.ErrorMessage));

            var list = JsonFileStore.ReadAll<CourseModel>(file).ToList();

            var existing = list.FirstOrDefault(x => string.Equals(x.Id, item.Id, StringComparison.OrdinalIgnoreCase));
            if (existing != null)
            {
                item.CreatedAt = existing.CreatedAt;
                item.CreatedBy = existing.CreatedBy;
                item.UpdatedAt = DateTime.UtcNow;
                list.Remove(existing);
            }
            else
            {
                item.CreatedAt = DateTime.UtcNow;
            }

            item.Title = (item.Title ?? "").Trim();
            item.ShortDesc = (item.ShortDesc ?? "").Trim();
            item.HtmlDesc = item.HtmlDesc ?? "";

            list.Add(item);
            JsonFileStore.WriteAll(file, list);

            return Ok(item);
        }

        // UPDATE
        [HttpPut, Route("{id}")]
        [ApiKey]
        public IHttpActionResult Update(string id, [FromBody] CourseModel item)
        {
            if (item == null) return BadRequest("Course payload is required.");

            var list = JsonFileStore.ReadAll<CourseModel>(file).ToList();
            var existing = list.FirstOrDefault(x => string.Equals(x.Id, id, StringComparison.OrdinalIgnoreCase));
            if (existing == null) return NotFound();

            existing.Title = item.Title ?? existing.Title;
            existing.HtmlDesc = item.HtmlDesc ?? existing.HtmlDesc;
            existing.ShortDesc = item.ShortDesc ?? existing.ShortDesc;
            existing.Duration = item.Duration ?? existing.Duration;
            existing.Image = item.Image ?? existing.Image;
            existing.Price = item.Price;
            existing.OfferPrice = item.OfferPrice;
            existing.Rating = item.Rating;
            existing.Status = item.Status;
            existing.UpdatedAt = DateTime.UtcNow;
            existing.UpdatedBy = item.UpdatedBy;

            var context = new ValidationContext(existing, null, null);
            var validationResults = new List<ValidationResult>();
            if (!Validator.TryValidateObject(existing, context, validationResults, true))
                return Content(HttpStatusCode.BadRequest, validationResults.Select(v => v.ErrorMessage));

            JsonFileStore.WriteAll(file, list);
            return Ok(existing);
        }

        // DELETE
        [HttpDelete, Route("{id}")]
        [ApiKey]
        public IHttpActionResult Delete(string id)
        {
            var ok = JsonFileStore.RemoveItem<CourseModel>(file,
                x => string.Equals(x.Id, id, StringComparison.OrdinalIgnoreCase));

            if (!ok) return NotFound();
            return Ok();
        }

        // UPLOAD BASE64
        [HttpPost, Route("upload-base64")]
        [ApiKey]
        public IHttpActionResult UploadBase64([FromBody] UploadRequest req)
        {
            if (req == null || string.IsNullOrWhiteSpace(req.Data) || string.IsNullOrWhiteSpace(req.Filename))
                return BadRequest("filename and data required");

            try
            {
                var data = req.Data;
                var comma = data.IndexOf(',');
                if (comma >= 0) data = data.Substring(comma + 1);

                var bytes = Convert.FromBase64String(data);
                var ext = Path.GetExtension(req.Filename);
                if (string.IsNullOrEmpty(ext)) ext = ".jpg";

                // OLD STYLE string format instead of interpolation
                var safeName = Guid.NewGuid().ToString("N") + ext;
                var savePath = Path.Combine(uploadsDir, safeName);

                File.WriteAllBytes(savePath, bytes);

                var relativePath = VirtualPathUtility.ToAbsolute("~/uploads/courses/" + safeName);
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
        }
    }
}
