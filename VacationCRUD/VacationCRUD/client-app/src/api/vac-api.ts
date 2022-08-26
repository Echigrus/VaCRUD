import axios, { AxiosError, AxiosInstance } from "axios";
import { GlobalConstants } from "../constants/global";
import { TVacation } from "../types/vacation";
import { ConnectionResp } from "./response-models/connection-response";
import { ErrorRequestResult, RequestResult } from "./response-models/request-result";
import { UserInfoResp } from "./response-models/user-info-response";
import { VacationListResp } from "./response-models/vacation-list-response";
import { VacationResp } from "./response-models/vacation-response";

class VacAPI {
    protected _httpClient: AxiosInstance;
    protected _token?: string;

    constructor(token?: string) {
        this._httpClient = axios.create({
            baseURL: GlobalConstants.BaseUrl,
            timeout: GlobalConstants.RequestTimeout
        });
        this._httpClient.defaults.headers.common['Content-Type'] = "application/json";
        if (token) {
            this._token = token;
            this._httpClient.defaults.headers.common['Authorization'] = "Bearer " + this._token;
        }
    }

    /**
    * Подключение к заданному в конструкторе адресу
    * @param login Логин
    * @param password Пароль
    * @returns Результат запроса
    */
    async getConnection(login: string, password: string): Promise<RequestResult<ConnectionResp>> {
        this._token = "";
        delete this._httpClient.defaults.headers.common['Authorization'];
        const result = await this.get<ConnectionResp>("/user/connection", { login: login, password: password });
        if (result.data) {
            this._token = result.data.token;
            this._httpClient.defaults.headers.common['Authorization'] = "Bearer " + this._token;
        }
        return result;
    }

    /**
     * Получение информации о текущем пользователе
     * @returns Результат запроса
     */
    async getUserInfo(): Promise<RequestResult<UserInfoResp>> {
        const result = await this.get<UserInfoResp>("/user/userInfo");
        return result;
    }

    /**
     * Создание периода отпуска
     * @param startDate Начало
     * @param endDate Конец
     * @returns Результат запроса
     */
    async createVacation(startDate: Date, endDate: Date): Promise<RequestResult<VacationResp>> {
        const result = await this.post<VacationResp>("/vacations/create", { start_date: startDate, end_date: endDate });
        if (result.data && result.data.data) {
            result.data.data.startDate = new Date(result.data.data.startDate);
            result.data.data.endDate = new Date(result.data.data.endDate);
        }
        return result;
    }

    /**
     * Чтение отпусков пользователя
     * @returns Результат запроса
     */
    async readVacationList(): Promise<RequestResult<VacationListResp>> {
        const result = await this.get<VacationListResp>("/vacations/readList");
        if (result.data && result.data.data) {
            result.data.data = result.data.data.map<TVacation>((v) => { return { id: v.id, startDate: new Date(v.startDate), endDate: new Date(v.endDate) } });
        }
        return result;
    }

    /**
     * Чтение отпуска по ID
     * @param id ID
     * @returns Результат запроса
     */
    async readVacation(id: number): Promise<RequestResult<VacationResp>> {
        const result = await this.get<VacationResp>("/vacations/read", { id: id });
        if (result.data && result.data.data) {
            result.data.data.startDate = new Date(result.data.data.startDate);
            result.data.data.endDate = new Date(result.data.data.endDate);
        }
        return result;
    }

    /**
     * Обновление периода отпуска
     * @param id Идентификатор
     * @param startDate Начало
     * @param endDate Конец
     * @returns Результат запроса
     */
    async updateVacation(id: number, startDate: Date, endDate: Date): Promise<RequestResult<VacationResp>> {
        const result = await this.post<VacationResp>("/vacations/update", { id: id, start_date: startDate, end_date: endDate });
        if (result.data && result.data.data) {
            result.data.data.startDate = new Date(result.data.data.startDate);
            result.data.data.endDate = new Date(result.data.data.endDate);
        }
        return result;
    }

    /**
     * Удаление периода отпуска
     * @param id Идентификатор
     * @returns Результат запроса
     */
    async deleteVacation(id: number): Promise<RequestResult<VacationResp>> {
        const result = await this.delete<VacationResp>("/vacations/delete", { id: id });
        if (result.data && result.data.data) {
            result.data.data.startDate = new Date(result.data.data.startDate);
            result.data.data.endDate = new Date(result.data.data.endDate);
        }
        return result;
    }

    /**
     * Закрытие сессии пользователем
     * @returns Результат запроса
     */
    async logout(): Promise<RequestResult<any>> {
        const result = await this.get<any>("/user/logout");
        return result;
    }

    /**
    * Отправка GET запроса
    * @param method Метод для запроса
    * @param params Параметры для строки запроса
    * @returns Результат запроса
    */
    protected async get<T>(method: string, params?: any): Promise<RequestResult<T>> {
        const result = new RequestResult<T>();
        try {
            const response = await this._httpClient.get<T>(method, { params: params });
            result.statusCode = response.status;
            if (response.status == 200) {
                result.data = response.data;
            }
            else {
                result.errors.push(response?.statusText);
            }
        }
        catch (error) {
            if (axios.isAxiosError(error) && error.response && error.response.data) {
                result.errors.push((error as AxiosError<any>).response?.data);
            } else {
                result.errors.push((error as Error).message);
            }
        }
        return result;
    }

    /**
    * Отправка POST запроса
    * @param method Метод для запроса
    * @param data Параметры для тела запроса
    * @param params Параметры для строки запроса
    * @returns Результат запроса
    */
    protected async post<T>(method: string, data?: any, params?: any): Promise<RequestResult<T>> {
        const result = new RequestResult<T>();
        try {
            const response = await this._httpClient.post<T>(method, data, { params: params });
            result.statusCode = response.status;
            if(response.status == 200) {
                result.data = response.data;
            }
            else {
                result.errors.push(response?.statusText);
            }
        }
        catch (error) {
            if (axios.isAxiosError(error) && error.response && error.response.data) {
                result.errors.push((error as AxiosError<any>).response?.data);
            } else {
                result.errors.push((error as Error).message);
            }
        }
        return result;
    }

    /**
    * Отправка DELETE запроса
    * @param method Метод для запроса
    * @param params Параметры для строки запроса
    * @returns Результат запроса
    */
    protected async delete<T>(method: string, params?: any): Promise<RequestResult<T>> {
        const result = new RequestResult<T>();
        try {
            const response = await this._httpClient.delete<T>(method, { params: params });
            result.statusCode = response.status;
            if (response.status == 200) {
                result.data = response.data;
            }
            else {
                result.errors.push(response?.statusText);
            }
        }
        catch (error) {
            if (axios.isAxiosError(error) && error.response && error.response.data) {
                result.errors.push((error as AxiosError<any>).response?.data);
            } else {
                result.errors.push((error as Error).message);
            }
        }
        return result;
    }
}

export { VacAPI };