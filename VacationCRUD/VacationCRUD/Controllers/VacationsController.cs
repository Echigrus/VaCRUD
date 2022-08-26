using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Web.WebPages;
using VacationCRUD.DBModels;

namespace VacationCRUD.Controllers
{
    [Route("api/vacations")]
    [Produces("application/json")]
    public class VacationsController : Controller
    {
        private readonly ApiContext _context;

        public VacationsController(ApiContext context)
        {
            _context = context;
        }

        private string GetToken(IHeaderDictionary hd)
        {
            string authHeader = hd.Authorization.FirstOrDefault();
            if (authHeader == null) return null;
            return authHeader.Replace("Bearer ", "");
        }

        private object Converter(Vacation vac)
        {
            return new
            {
                id = vac.Id,
                startDate = vac.StartDate.ToDateTime(new TimeOnly()),
                endDate = vac.EndDate.ToDateTime(new TimeOnly())
            };
        }

        [HttpPost("create")]
        public ActionResult Create([FromBody] JsonDocument body)
        {
            try
            {
                string token = GetToken(Request.Headers);
                if (token == null) return Unauthorized();
                JsonElement root = body.RootElement;
                return Json(new
                {
                    data = Converter(_context.AddVacation(
                        token,
                        DateOnly.FromDateTime(root.GetProperty("start_date").GetDateTime()),
                        DateOnly.FromDateTime(root.GetProperty("end_date").GetDateTime())))
                }) ;
            }
            catch (Exception e)
            {
                if (e is AccessViolationException)
                {
                    return Unauthorized(e.Message);
                }
                return BadRequest(e.Message);
            }
        }

        [HttpGet("readList")]
        public ActionResult ReadList()
        {
            try
            {
                string token = GetToken(Request.Headers);
                if (token == null) return Unauthorized();
                return Json(new
                {
                    data = _context.GetCurrentUserVacationList(token).ConvertAll(Converter)
                });
            }
            catch (Exception e)
            {
                return Unauthorized(e.Message);
            }
        }

        [HttpGet("read")]
        public ActionResult Read(int id)
        {
            try
            {
                string token = GetToken(Request.Headers);
                if (token == null) return Unauthorized();
                return Json(new
                {
                    data = Converter(_context.GetCurrentUserVacation(token, id))
                });
            }
            catch (Exception e)
            {
                return Unauthorized(e.Message);
            }
        }

        [HttpPost("update")]
        public ActionResult Update([FromBody] JsonDocument body)
        {
            try
            {
                string token = GetToken(Request.Headers);
                if (token == null) return Unauthorized();
                JsonElement root = body.RootElement;
                return Json(new
                {
                    data = Converter(_context.UpdateVacation(
                        token,
                        root.GetProperty("id").GetInt32(),
                        DateOnly.FromDateTime(root.GetProperty("start_date").GetDateTime()),
                        DateOnly.FromDateTime(root.GetProperty("end_date").GetDateTime())))
                });
            }
            catch (Exception e)
            {
                if (e is AccessViolationException)
                {
                    return Unauthorized(e.Message);
                }
                return BadRequest(e.Message);
            }
        }

        [HttpDelete("delete")]
        public ActionResult Delete(int id)
        {
            try
            {
                string token = GetToken(Request.Headers);
                if (token == null) return Unauthorized();
                return Json(new
                {
                    data = Converter(_context.DeleteVacation(token, id))
                });
            }
            catch (Exception e)
            {
                if(e is AccessViolationException)
                {
                    return Unauthorized(e.Message);
                }
                return BadRequest(e.Message);
            }
        }
    }
}
