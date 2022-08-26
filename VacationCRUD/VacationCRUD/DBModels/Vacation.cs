using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VacationCRUD.DBModels
{
    public class Vacation
    {
        /// <summary>
        /// ID периода отпуска
        /// </summary>
        [Key, Column(Order = 0)]
        public int Id { get; set; }

        /// <summary>
        /// ID пользователя
        /// </summary>
        public int UserId { get; set; }
        
        /// <summary>
        /// Дата начала
        /// </summary>
        public DateOnly StartDate { get; set; }
    
        /// <summary>
        /// Дата окончания
        /// </summary>
        public DateOnly EndDate { get; set; }

        /// <summary>
        /// Станция клонирования отпусков
        /// </summary>
        /// <returns>Клон</returns>
        public Vacation Clone()
        {
            Vacation res = new Vacation();
            res.Id = Id;
            res.UserId = UserId;
            res.StartDate = StartDate;
            res.EndDate = EndDate;
            return res;
        }
    }
}
