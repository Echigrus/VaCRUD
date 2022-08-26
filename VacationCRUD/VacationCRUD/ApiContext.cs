using Microsoft.EntityFrameworkCore;
using VacationCRUD.DBModels;

namespace VacationCRUD
{
    public class ApiContext : DbContext
    {
        public ApiContext(DbContextOptions<ApiContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }

        /// <summary>
        /// Находится ли дата в периоде
        /// </summary>
        /// <param name="date">Сверяемая дата</param>
        /// <param name="from">Начало периода</param>
        /// <param name="to">Конец периода</param>
        /// <returns>Результат</returns>
        private bool IsDateInPeriod(DateOnly date, DateOnly from, DateOnly to)
        {
            return (date.DayNumber >= from.DayNumber && date.DayNumber =< to.DayNumber);
        }

        /// <summary>
        /// Все пользователи
        /// </summary>
        /// <returns>Список пользователей</returns>
        public List<User> GetUsers()
        {
            return Users.ToList<User>();
        }

        /// <summary>
        /// Текущий пользователь по токену
        /// </summary>
        /// <param name="token">Токен пользователя</param>
        /// <returns>Пользователь</returns>
        public User? GetCurrentUser(string token)
        {
            return GetUsers().Find(u => u.Token == token);
        }

        /// <summary>
        /// Получение пользователя по логину-паролю
        /// </summary>
        /// <param name="login">Логин</param>
        /// <param name="password">Пароль</param>
        /// <returns>Пользователь</returns>
        public User? GetUserIfValid(string login, string password)
        {
            return GetUsers().Find(u => u.Login == login && u.Password == password);
        }

        public DbSet<Vacation> Vacations { get; set; }

        /// <summary>
        /// Периоды отпуска текущего пользователя
        /// </summary>
        /// <param name="token">Токен</param>
        /// <returns>Список периодов отпуска</returns>
        /// <exception cref="AccessViolationException">Неправильный токен</exception>
        public List<Vacation> GetCurrentUserVacationList(string token)
        {
            User curUser = GetCurrentUser(token);
            if (curUser == null)
            {
                throw new AccessViolationException();
            }
            return Vacations.Where(v => v.UserId == curUser.Id).ToList();
        }

        /// <summary>
        /// Период отпуска текущего пользователя по ID
        /// </summary>
        /// <param name="token">Токен</param>
        /// <param name="id">ID</param>
        /// <returns>Период отпуска</returns>
        /// <exception cref="AccessViolationException">Неправильный токен</exception>
        /// <exception cref="Exception">Период не обнаружен</exception>
        public Vacation GetCurrentUserVacation(string token, int id)
        {
            User curUser = GetCurrentUser(token);
            if (curUser == null)
            {
                throw new AccessViolationException();
            }
            Vacation vacation = Vacations.FirstOrDefault(v => v.UserId == curUser.Id && v.Id == id);
            if (vacation == null)
            {
                throw new Exception("Период не найден");
            }
            return vacation;
        }

        /// <summary>
        /// Кол-во запланированных дней текущего пользователя
        /// </summary>
        /// <param name="userId">ID пользователя</param>
        /// <returns>Кол-во запланированных</returns>
        public int GetCurrentUserPlannedDays(int userId)
        {
            int totalPlanned = 0;
            List<Vacation> vacations = Vacations.Where(v => v.UserId == userId).ToList();
            for (int i = 0; i < vacations.Count; i++)
            {
                totalPlanned += vacations[i].EndDate.DayNumber - vacations[i].StartDate.DayNumber + 1;
            }
            return totalPlanned;
        }

        /// <summary>
        /// Добавление периода отпуска
        /// </summary>
        /// <param name="token">Токен</param>
        /// <param name="startDate">Дата начала</param>
        /// <param name="endDate">Дата окончания</param>
        /// <returns>Добавленный период</returns>
        /// <exception cref="AccessViolationException">Неправильный токен</exception>
        /// <exception cref="Exception">Превышение лимита дней/Некорректный период</exception>
        public Vacation? AddVacation(string token, DateOnly startDate, DateOnly endDate)
        {
            User curUser = GetCurrentUser(token);
            if (curUser == null)
            {
                throw new AccessViolationException();
            }
            if (startDate.DayNumber > endDate.DayNumber)
            {
                throw new Exception("Путешествия во времени запрещены законами физики.");
            }
            if (GetCurrentUserPlannedDays(curUser.Id) + (endDate.DayNumber - startDate.DayNumber + 1) > curUser.TotalVacationDays)
            {
                throw new Exception("Добавляемый период превышает лимит дней.");
            }
            List<Vacation> vacations = GetCurrentUserVacationList(token);
            if(vacations.Count > 0)
            {
                vacations.ForEach(v => {
                    if(IsDateInPeriod(startDate, v.StartDate, v.EndDate) || IsDateInPeriod(endDate, v.StartDate, v.EndDate))
                    {
                        throw new Exception("Конфликтует с периодом: "+v.StartDate.ToString()+"-"+v.EndDate.ToString());
                    }
                });
            }
            Vacation newVac = new Vacation();
            newVac.UserId = curUser.Id;
            newVac.StartDate = startDate;
            newVac.EndDate = endDate;
            Vacations.Add(newVac);
            SaveChanges();
            return newVac;
        }

        /// <summary>
        /// Получение периода отпуска
        /// </summary>
        /// <param name="id">ID периода</param>
        /// <param name="userId">ID пользователя</param>
        /// <returns>Период отпуска</returns>
        /// <exception cref="Exception">Период не обнаружен</exception>
        public Vacation? GetVacation(int id, int userId)
        {
            Vacation vacation = Vacations.FirstOrDefault(v => v.UserId == userId && v.Id == id);
            if(vacation == null)
            {
                throw new Exception("Период не найден");
            }
            return vacation;
        }

        /// <summary>
        /// Обновление периода отпуска
        /// </summary>
        /// <param name="token">Токен</param>
        /// <param name="id">ID периода</param>
        /// <param name="startDate">Дата начала</param>
        /// <param name="endDate">Дата окончания</param>
        /// <returns>Обновлённый период</returns>
        /// <exception cref="AccessViolationException">Неверный токен</exception>
        /// <exception cref="Exception">Период не найден/Превышен лимит/Некорректный период</exception>
        public Vacation? UpdateVacation(string token, int id, DateOnly startDate, DateOnly endDate)
        {
            User curUser = GetCurrentUser(token);
            if (curUser == null)
            {
                throw new AccessViolationException();
            }
            Vacation vacation = Vacations.FirstOrDefault(v => v.UserId == curUser.Id && v.Id == id);
            if (vacation == null)
            {
                throw new Exception("Период не найден");
            }
            if (startDate.DayNumber > endDate.DayNumber)
            {
                throw new Exception("Путешествия во времени запрещены законами физики.");
            }
            if (GetCurrentUserPlannedDays(curUser.Id) 
                - (vacation.EndDate.DayNumber - vacation.StartDate.DayNumber) 
                + (endDate.DayNumber - startDate.DayNumber) > curUser.TotalVacationDays)
            {
                throw new Exception("Изменение периода превышает лимит дней.");
            }
            List<Vacation> vacations = GetCurrentUserVacationList(token);
            if (vacations.Count > 0)
            {
                vacations.ForEach(v => {
                    if (v.Id != id && (IsDateInPeriod(startDate, v.StartDate, v.EndDate) || IsDateInPeriod(endDate, v.StartDate, v.EndDate)))
                    {
                        throw new Exception("Конфликтует с периодом: " + v.StartDate.ToString() + "-" + v.EndDate.ToString());
                    }
                });
            }
            vacation.StartDate = startDate;
            vacation.EndDate = endDate;
            Vacations.Update(vacation);
            SaveChanges();
            return vacation;
        }

        /// <summary>
        /// Удаление периода отпуска
        /// </summary>
        /// <param name="token">Токен</param>
        /// <param name="id">ID периода</param>
        /// <returns>Удаляемый период</returns>
        /// <exception cref="AccessViolationException">Неверный токен</exception>
        /// <exception cref="Exception">Период не найден</exception>
        public Vacation? DeleteVacation(string token, int id)
        {
            User curUser = GetCurrentUser(token);
            if (curUser == null)
            {
                throw new AccessViolationException();
            }
            Vacation vacation = Vacations.FirstOrDefault(v => v.UserId == curUser.Id && v.Id == id);
            Vacation result = vacation.Clone();
            if (vacation == null)
            {
                throw new Exception("Период не найден");
            }
            Vacations.Remove(vacation);
            SaveChanges();
            return result;
        }
    }
}
