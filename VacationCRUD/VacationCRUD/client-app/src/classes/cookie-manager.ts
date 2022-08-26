export class CookieManager {
    /**
     * Получение данных по ключу
     * @param name Ключ
     * @returns Значение или undefined
     */
    static getCookie(name: string) {
        const matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    /**
     * Устанавливает парчу ключ-значение
     * @param name Ключ
     * @param value Значение
     * @param options Параметры
     */
    static setCookie(name: string, value: string, options: {} | any) {
        options = {
            path: '/',
            // при необходимости добавьте другие значения по умолчанию
            ...options
        };

        if (options["expires"] instanceof Date) {
            options["expires"] = options["expires"].toUTCString();
        }

        let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

        for (let optionKey in options) {
            updatedCookie += "; " + optionKey;
            let optionValue = options[optionKey];
            if (optionValue !== true) {
                updatedCookie += "=" + optionValue;
            }
        }

        document.cookie = updatedCookie;
    }

    /**
     * Удаляет значени по ключу
     * @param name Ключ
     */
    static deleteCookie(name: string) {
        CookieManager.setCookie(name, "", {
            'max-age': -1
        });
    }
}