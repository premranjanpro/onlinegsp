using OnlineGspApp.Helpers;
using OnlineGspApp.Models;
using OnlineGspApp.Security;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web.Http;

namespace OnlineGspApp.Controllers
{
    [RoutePrefix("api/news")]
    public class NewsController : ApiController
    {
        private readonly string file = System.Web.Hosting.HostingEnvironment.MapPath("~/App_Data/news.json");
        private readonly string uploadsDir = System.Web.Hosting.HostingEnvironment.MapPath("~/uploads/news/");

        public NewsController()
        {
            if (!Directory.Exists(uploadsDir))
                Directory.CreateDirectory(uploadsDir);

            if (!File.Exists(file))
                JsonFileStore.WriteAll(file, new List<NewsModel>());
        }

        [HttpGet, Route("")]
        public IHttpActionResult GetAll()
        {
            var all = JsonFileStore.ReadAll<NewsModel>(file)
                                   .OrderByDescending(x => x.CrcDate)
                                   .ToList();

            return Ok(all);
        }

        [HttpGet, Route("{id}")]
        public IHttpActionResult GetById(string id)
        {
            var all = JsonFileStore.ReadAll<NewsModel>(file);
            var found = all.FirstOrDefault(x =>
                string.Equals(x.Id, id, StringComparison.OrdinalIgnoreCase));

            if (found == null) return NotFound();

            return Ok(found);
        }

        [HttpPost, Route("")]
        [ApiKey]
        public IHttpActionResult Create([FromBody] NewsModel item)
        {
            if (item == null)
                return BadRequest("Payload required");

            var list = JsonFileStore.ReadAll<NewsModel>(file).ToList();

            if (string.IsNullOrWhiteSpace(item.Id))
                item.Id = Guid.NewGuid().ToString("N");

            item.CrcDate = DateTime.UtcNow;

            list.Add(item);
            JsonFileStore.WriteAll(file, list);

            return Ok(item);
        }

        [HttpPut, Route("{id}")]
        [ApiKey]
        public IHttpActionResult Update(string id, [FromBody] NewsModel item)
        {
            if (item == null)
                return BadRequest("Payload required");

            var list = JsonFileStore.ReadAll<NewsModel>(file).ToList();
            var existing = list.FirstOrDefault(x =>
                string.Equals(x.Id, id, StringComparison.OrdinalIgnoreCase));

            if (existing == null)
                return NotFound();

            existing.Title = item.Title ?? existing.Title;
            existing.HtmlBody = item.HtmlBody ?? existing.HtmlBody;
            existing.Images = item.Images ?? existing.Images;
            existing.Status = item.Status ?? existing.Status;

            existing.UpdatedAt = DateTime.UtcNow;
            existing.UpdatedBy = item.UpdatedBy;

            JsonFileStore.WriteAll(file, list);

            return Ok(existing);
        }

        [HttpDelete, Route("{id}")]
        [ApiKey]
        public IHttpActionResult Delete(string id)
        {
            var ok = JsonFileStore.RemoveItem<NewsModel>(file,
                x => string.Equals(x.Id, id, StringComparison.OrdinalIgnoreCase));

            if (!ok) return NotFound();
            return Ok();
        }
    }
}
