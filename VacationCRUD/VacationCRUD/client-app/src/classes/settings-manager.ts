import { GlobalConstants } from "../constants/global";
import { TCredentials } from "../types/credentials";
import { CookieManager } from "./cookie-manager";

class SettingsManager {
    /**
	* Запись данных сессии
	* @param credentials Данные сессии
	*/
	static setConnectionCredentials(credentials: TCredentials) {
		CookieManager.setCookie(GlobalConstants.ConnectionCredentialsProperty, JSON.stringify(credentials), { expires: Date.now() + 86400e3 });
	}

    /**
	* Чтение данных сессии
	* @returns Данные сессии
	*/
	static getConnectionCredentials(): TCredentials {
		let credentials: TCredentials = {};
		const value = CookieManager.getCookie(GlobalConstants.ConnectionCredentialsProperty);
		if (value) {
			credentials = JSON.parse(value);
		}
		return credentials;
	}

    /**
	 * Обновляет данные сессии
	 * @param credentials Данные сессии
	 */
	static updateConnectionCredentials(credentials: TCredentials) {
		const oldCreds = this.getConnectionCredentials();
		if(!oldCreds) {
			this.setConnectionCredentials(credentials);
		}
		else {
			this.setConnectionCredentials({...oldCreds, ...credentials});
		}
	}

	/**
	 * Очистка данных сессии
	 */
	static clearConnectionCredentials() {
		this.setConnectionCredentials({ token: "", login: "" });
	}
}

export { SettingsManager };