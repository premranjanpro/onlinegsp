using OnlineGspApp.Helpers;
using OnlineGspApp.Models;
using OnlineGspApp.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace OnlineGspApp.Controllers
{
    [RoutePrefix("api/results")]
    public class ResultsController : ApiController
    {
        private readonly string file = System.Web.Hosting.HostingEnvironment.MapPath("~/App_Data/results.json");

        public ResultsController()
        {
            if (!System.IO.File.Exists(file)) JsonFileStore.WriteAll(file, new List<ResultModel>());
        }

        [HttpGet, Route("")]
        public IHttpActionResult GetAll()
        {
            var all = JsonFileStore.ReadAll<ResultModel>(file).OrderByDescending(x => x.CreatedAt).ToList();
            return Ok(all);
        }


        [HttpGet, Route("{enrolno}")]
        public IHttpActionResult GetByEnrol(string enrolno)
        {
            var all = JsonFileStore.ReadAll<ResultModel>(file);
            var rec = all.FirstOrDefault(x => string.Equals(x.ENROLNO.Replace("/", ""), enrolno, StringComparison.OrdinalIgnoreCase));
            if (rec == null) return NotFound();
            return Ok(rec);
        }

        [HttpPost, Route("")]
        [ApiKey]
        public IHttpActionResult Create([FromBody] ResultModel item)
        {
            if (item == null) return BadRequest("Payload required");
            var list = JsonFileStore.ReadAll<ResultModel>(file).ToList();

            // ENROLNO unique
            if (!string.IsNullOrWhiteSpace(item.ENROLNO))
            {
                var other = list.FirstOrDefault(x => string.Equals(x.ENROLNO, item.ENROLNO, StringComparison.OrdinalIgnoreCase));
                if (other != null) return Content(HttpStatusCode.BadRequest, "ENROLNO already exists");
            }

            if (string.IsNullOrWhiteSpace(item.Id)) item.Id = Guid.NewGuid().ToString("N");
            item.CreatedAt = DateTime.UtcNow;
            list.Add(item);
            JsonFileStore.WriteAll(file, list);
            return Ok(item);
        }

        [HttpPut, Route("{id}")]
        [ApiKey]
        public IHttpActionResult Update(string id, [FromBody] ResultModel item)
        {
            if (item == null) return BadRequest("Payload required");
            var list = JsonFileStore.ReadAll<ResultModel>(file).ToList();
            var existing = list.FirstOrDefault(x => string.Equals(x.Id, id, StringComparison.OrdinalIgnoreCase));
            if (existing == null) return NotFound();

            // If ENROLNO changing ensure uniqueness
            if (!string.IsNullOrWhiteSpace(item.ENROLNO) && !string.Equals(existing.ENROLNO, item.ENROLNO, StringComparison.OrdinalIgnoreCase))
            {
                var other = list.FirstOrDefault(x => !string.Equals(x.Id, id, StringComparison.OrdinalIgnoreCase)
                    && string.Equals(x.ENROLNO, item.ENROLNO, StringComparison.OrdinalIgnoreCase));
                if (other != null) return Content(HttpStatusCode.BadRequest, "ENROLNO already exists");
            }

            existing.ENROLNO = item.ENROLNO ?? existing.ENROLNO;
            existing.ROLLNO = item.ROLLNO ?? existing.ROLLNO;
            existing.BRANCHNAME = item.BRANCHNAME ?? existing.BRANCHNAME;
            existing.COURSENAME = item.COURSENAME ?? existing.COURSENAME;
            existing.DURATION = item.DURATION ?? existing.DURATION;
            existing.NAMEANDFATHERSNAME = item.NAMEANDFATHERSNAME ?? existing.NAMEANDFATHERSNAME;
            existing.DOJ = item.DOJ ?? existing.DOJ;
            existing.DOC = item.DOC ?? existing.DOC;
            existing.ISSUEDATE = item.ISSUEDATE ?? existing.ISSUEDATE;

            existing.UpdatedAt = DateTime.UtcNow;
            existing.UpdatedBy = item.UpdatedBy;

            JsonFileStore.WriteAll(file, list);
            return Ok(existing);
        }

        [HttpDelete, Route("{id}")]
        [ApiKey]
        public IHttpActionResult Delete(string id)
        {
            var ok = JsonFileStore.RemoveItem<ResultModel>(file, x => string.Equals(x.Id, id, StringComparison.OrdinalIgnoreCase));
            if (!ok) return NotFound();
            return Ok();
        }
    }
}