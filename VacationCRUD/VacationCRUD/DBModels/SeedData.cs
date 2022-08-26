using Microsoft.EntityFrameworkCore;

namespace VacationCRUD.DBModels
{
    public static class SeedData
    {
        public static void Initialize(IServiceProvider serviceProvider)
        {
            using (var context = new VacationCRUD.ApiContext(serviceProvider.GetRequiredService<DbContextOptions<ApiContext>>()))
            {
                var testUser1 = new DBModels.User
                {
                    Id = 1,
                    Token = "xMiIsInR5cCI6IkpeyJhbGciOiJIUzU",
                    Login = "TST",
                    Password = "p@ssw0rd",
                    TotalVacationDays = 28
                };

                context.Users.Add(testUser1);

                var testVacation1 = new DBModels.Vacation
                {
                    Id = 1,
                    UserId = 1,
                    StartDate = new DateOnly(2022, 8, 22),
                    EndDate = new DateOnly(2022, 9, 4)
                };

                context.Vacations.Add(testVacation1);

                context.SaveChanges();
            }
        }
    }
}
