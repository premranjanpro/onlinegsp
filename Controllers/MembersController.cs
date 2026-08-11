using OnlineGspApp.Helpers;
using OnlineGspApp.Models;
using OnlineGspApp.Security;
using OnlineGspApp.Services;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web.Http;

namespace OnlineGspApp.Controllers
{
    [RoutePrefix("api/members")]
    public class MembersController : ApiController
    {
        private readonly string file = System.Web.Hosting.HostingEnvironment.MapPath("~/App_Data/members.json");
        private readonly string uploadsDir = System.Web.Hosting.HostingEnvironment.MapPath("~/uploads/members/");

        private static readonly string[] States = new[] {
            "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh",
            "Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland",
            "Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttarakhand","Uttar Pradesh","West Bengal","Other"
        };

        public MembersController()
        {
            if (!Directory.Exists(uploadsDir)) Directory.CreateDirectory(uploadsDir);
            if (!File.Exists(file)) JsonFileStore.WriteAll(file, new List<MemberModel>());
        }

        [HttpGet, Route("")]
        public IHttpActionResult GetAll()
        {
            var all = JsonFileStore.ReadAll<MemberModel>(file)
                                   .OrderByDescending(x => x.CreatedAt)
                                   .ToList();
            return Ok(all);
        }

        [HttpGet, Route("{id}")]
        public IHttpActionResult GetById(string id)
        {
            var all = JsonFileStore.ReadAll<MemberModel>(file);
            var found = all.FirstOrDefault(x => string.Equals(x.Id, id, StringComparison.OrdinalIgnoreCase));
            if (found == null) return NotFound();
            return Ok(found);
        }

        [HttpGet, Route("lookup")]
        public IHttpActionResult LookupByEmailMobile(string email, string mobile)
        {
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(mobile))
                return BadRequest("email and mobile are required.");

            var all = JsonFileStore.ReadAll<MemberModel>(file);
            var found = all.FirstOrDefault(x =>
                string.Equals(x.EMAIL ?? "", email, StringComparison.OrdinalIgnoreCase) &&
                string.Equals(x.Phone ?? "", mobile, StringComparison.OrdinalIgnoreCase)
            );

            if (found == null) return NotFound();
            return Ok(found);
        }

        [HttpGet, Route("states")]
        public IHttpActionResult GetStates()
        {
            return Ok(States);
        }

        [HttpPost, Route("")]
        [ApiKey]
        public IHttpActionResult Create([FromBody] MemberModel item)
        {
            if (item == null) return BadRequest("Payload required");

            var list = JsonFileStore.ReadAll<MemberModel>(file).ToList();

            if (!string.IsNullOrWhiteSpace(item.EMAIL))
            {
                var other = list.FirstOrDefault(x => string.Equals(x.EMAIL, item.EMAIL, StringComparison.OrdinalIgnoreCase));
                if (other != null) return Content(HttpStatusCode.BadRequest, "Email already exists");
            }

            if (string.IsNullOrWhiteSpace(item.Id))
                item.Id = Guid.NewGuid().ToString("N");

            item.CreatedAt = DateTime.UtcNow;

            list.Add(item);
            JsonFileStore.WriteAll(file, list);
            return Ok(item);
        }

        [HttpPut, Route("{id}")]
        [ApiKey]
        public IHttpActionResult Update(string id, [FromBody] MemberModel item)
        {
            if (item == null) return BadRequest("Payload required");

            var list = JsonFileStore.ReadAll<MemberModel>(file).ToList();
            var existing = list.FirstOrDefault(x => string.Equals(x.Id, id, StringComparison.OrdinalIgnoreCase));

            if (existing == null) return NotFound();

            if (!string.IsNullOrWhiteSpace(item.EMAIL))
            {
                var other = list.FirstOrDefault(x =>
                    !string.Equals(x.Id, id, StringComparison.OrdinalIgnoreCase) &&
                    string.Equals(x.EMAIL, item.EMAIL, StringComparison.OrdinalIgnoreCase)
                );

                if (other != null) return Content(HttpStatusCode.BadRequest, "Email already exists");
            }

            existing.NAME = item.NAME ?? existing.NAME;
            existing.Center = item.Center ?? existing.Center;
            existing.EMAIL = item.EMAIL ?? existing.EMAIL;
            existing.ENROLNO = item.ENROLNO ?? existing.ENROLNO;
            existing.ROLLNO = item.ROLLNO ?? existing.ROLLNO;
            existing.Address1 = item.Address1 ?? existing.Address1;
            existing.Address2 = item.Address2 ?? existing.Address2;
            existing.Phone = item.Phone ?? existing.Phone;
            existing.PhoneAlternate = item.PhoneAlternate ?? existing.PhoneAlternate;
            existing.State = item.State ?? existing.State;
            existing.City = item.City ?? existing.City;
            existing.District = item.District ?? existing.District;
            existing.AadharCardNo = item.AadharCardNo ?? existing.AadharCardNo;
            existing.Password = item.Password ?? existing.Password;
            existing.PhotoOfOwner = item.PhotoOfOwner ?? existing.PhotoOfOwner;
            existing.AadharCardImage = item.AadharCardImage ?? existing.AadharCardImage;           
            existing.CenterLogo = item.CenterLogo ?? existing.CenterLogo;
            existing.CertificateImage = item.CertificateImage ?? existing.CertificateImage;
            existing.LetterImage = item.LetterImage ?? existing.LetterImage;
            existing.STATUS = item.STATUS ?? existing.STATUS;
            existing.REMARKS = item.REMARKS ?? existing.REMARKS;
            existing.UpdatedAt = DateTime.UtcNow;
            existing.UpdatedBy = item.UpdatedBy;

            JsonFileStore.WriteAll(file, list);
            return Ok(existing);
        }

        [HttpDelete, Route("{id}")]
        [ApiKey]
        public IHttpActionResult Delete(string id)
        {
            var ok = JsonFileStore.RemoveItem<MemberModel>(
                file,
                x => string.Equals(x.Id, id, StringComparison.OrdinalIgnoreCase)
            );

            if (!ok) return NotFound();
            return Ok();
        }
    }
}
