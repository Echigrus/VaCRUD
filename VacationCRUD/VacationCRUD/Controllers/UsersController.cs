using Microsoft.AspNetCore.Mvc;
using VacationCRUD.DBModels;

namespace VacationCRUD.Controllers
{
    [Route("api/user")]
    [Produces("application/json")]
    public class UsersController : Controller
    {
        private readonly ApiContext _context;

        public UsersController(ApiContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Подключение
        /// </summary>
        /// <param name="login">Логин</param>
        /// <param name="password">Пароль</param>
        /// <returns>Токен</returns>
        [HttpGet("connection")]
        public ActionResult Connection(string login, string password)
        {
            User user = _context.GetUserIfValid(login, password);
            if (user == null) return Unauthorized("Некорректная связка логин-пароль.");
            return Json(new {
                token = user.Token
            });
        }

        /// <summary>
        /// Информация о текущем пользователе
        /// </summary>
        /// <returns>Информация о пользователе</returns>
        [HttpGet("userInfo")]
        public ActionResult UserInfo()
        {
            string authHeader = Request.Headers.Authorization.FirstOrDefault();
            if (authHeader == null) return Unauthorized();
            string token = authHeader.Replace("Bearer ", "");
            User user = _context.GetCurrentUser(token);
            if (user == null) return Unauthorized();
            return Json(new {
                data = new {
                    id = user.Id,
                    login = user.Login,
                    totalVacationDays = user.TotalVacationDays,
                    usedVacationDays = _context.GetCurrentUserPlannedDays(user.Id)
                }
            });
        }

        /// <summary>
        /// Выход
        /// </summary>
        /// <returns>Ok-результат</returns>
        [HttpGet("logout")]
        public ActionResult Logout()
        {
            return Ok();
        }
    }
}
