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
    [RoutePrefix("api/enquiries")]
    public class EnquiriesController : ApiController
    {
        private readonly string file = System.Web.Hosting.HostingEnvironment.MapPath("~/App_Data/enquiries.json");

        public EnquiriesController()
        {
            // Ensure file exists
            if (!File.Exists(file))
            {
                JsonFileStore.WriteAll(file, new List<EnquiryModel>());
            }
        }

        [HttpGet, Route("")]
        public IHttpActionResult GetAll()
        {
            var all = JsonFileStore.ReadAll<EnquiryModel>(file)
                                   .OrderByDescending(x => x.CreatedAt)
                                   .ToList();
            return Ok(all);
        }

        [HttpPost, Route("")]
        [ApiKey]
        public IHttpActionResult Create([FromBody] EnquiryModel item)
        {
            if (item == null)
                return BadRequest("Payload required");

            var list = JsonFileStore.ReadAll<EnquiryModel>(file).ToList();

            if (string.IsNullOrWhiteSpace(item.Id))
                item.Id = Guid.NewGuid().ToString("N");

            item.CreatedAt = DateTime.UtcNow;

            list.Add(item);
            JsonFileStore.WriteAll(file, list);

            return Ok(item);
        }

        [HttpDelete, Route("{id}")]
        [ApiKey]
        public IHttpActionResult Delete(string id)
        {
            var ok = JsonFileStore.RemoveItem<EnquiryModel>(
                file,
                x => string.Equals(x.Id, id, StringComparison.OrdinalIgnoreCase)
            );

            if (!ok) return NotFound();

            return Ok();
        }
    }
}
