using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace VacationCRUD.DBModels
{
    public class User
    {
        /// <summary>
        /// ID пользователя
        /// </summary>
        [Key, Column(Order = 0)]
        public int Id { get; set; }
        /// <summary>
        /// Токен текущей сессии пользователя
        /// </summary>
        public string Token { get; set; }

        /// <summary>
        /// Логин
        /// </summary>
        public string Login { get; set; }

        /// <summary>
        /// Пароль
        /// </summary>
        public string Password { get; set; }

        /// <summary>
        /// Всего доступных дней отпуска
        /// </summary>
        public int TotalVacationDays { get; set; }
    }
}
