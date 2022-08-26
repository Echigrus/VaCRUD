import { VacAPI } from "../api/vac-api";
import { RequestResult } from "../api/response-models/request-result";
import { SettingsManager } from "./settings-manager";

class VacAPIManager {
    /**
    * Вызывает метод из API
    * @param method Вызов метода из API
    * @returns Результат вызова метода
    */
    static async request<T>(method: (api: VacAPI) => Promise<RequestResult<any>>): Promise<RequestResult<T>> {
        let ca: VacAPI;
        const creds = SettingsManager.getConnectionCredentials();
        if (!creds.token) {
            return { statusCode: 401, errors: ["Срок действия сессии закончился."] };
        }
        else {
            ca = new VacAPI(creds.token);
        }

        let result = await method(ca);
        return result;
    }
}

export { VacAPIManager };