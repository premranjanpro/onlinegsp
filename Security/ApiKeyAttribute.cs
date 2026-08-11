using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using System.Configuration;


namespace OnlineGspApp.Security
{
    public class ApiKeyAttribute : AuthorizationFilterAttribute
    {
        private readonly string _header = "X-Api-Key";
        public override void OnAuthorization(HttpActionContext actionContext)
        {
            IEnumerable<string> values;
            if (!actionContext.Request.Headers.TryGetValues(_header, out values) || values == null || values.FirstOrDefault() != GetServerApiKey())
            {
                actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.Unauthorized, "Invalid API key");
                return;
            }
            base.OnAuthorization(actionContext);
        }

        private string GetServerApiKey()
        {
            return "gsptestkey";
        }
    }
}
