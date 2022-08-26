export class GlobalConstants {
    /// Точки входа
    public static MainRoot = "vacrud-root";

    public static ActivePivotParam = "activePivot";
    public static ActivePivotConnectionValue = "vacrud-connection-pivot";
    public static ActivePivotVacationListValue = "vacrud-vacation-list-pivot";
    public static ActivePivotLogoutValue = "vacrud-logout-pivot";

    // URL API
    public static BaseUrl = "https://localhost:3000/api";
    // Таймаут запросов
    public static RequestTimeout = 30000;
    // Кол-во символов для появления overflow в notification-bar
    public static OverflowCharLimit = 100;

    /// Хранимые свойства
    /**
     * Хранит данные сессии, TCredentials
     */
    public static ConnectionCredentialsProperty = "VaCRUD.Properties.ConnectionCredentials";
}