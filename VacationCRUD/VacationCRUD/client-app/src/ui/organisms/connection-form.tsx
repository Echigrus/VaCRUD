import { PrimaryButton, Stack, TextField } from "@fluentui/react";
import * as React from "react";
import { useEffect, useState } from "react";
import { ConnectionResp } from "../../api/response-models/connection-response";
import { RequestResult } from "../../api/response-models/request-result";
import { VacAPI } from "../../api/vac-api";
import { messageService } from "../../classes/message-service";
import { SettingsManager } from "../../classes/settings-manager";
import { GlobalConstants } from "../../constants/global";
import { Loader } from "../atoms/loader";
import { SeparatorTitle } from "../atoms/separator-title";

type TProps = {
    setActivePivot: React.Dispatch<React.SetStateAction<string>>
};

const ConnectionForm = ({ setActivePivot }: TProps): JSX.Element => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [loginValue, setLoginValue] = useState<string>("");
    const [passValue, setPassValue] = useState<string>("");

    const loginMask = /^[\w._]{2,19}[0-9a-zA-Z]$/;

    function validateInput(): boolean {
        if (!loginMask.test(loginValue)) {
            messageService.sendError("Некорректный логин (от 3 до 20, латиница, цифры, '.' и '_').");
            return false;
        }
        if (passValue == "") {
            messageService.sendError("Пароль не может быть пустым.");
            return false;
        }
        return true;
    }

    function handleErrors(result: RequestResult<ConnectionResp>) {
        switch (result.errors[0]) {
            case "Request failed with status code 401":
                messageService.sendError("Указанные данные не подошли.");
                break;
            case "Request failed with status code 400":
                messageService.sendError("Ошибка при создании запроса или его обработке на сервере. Обратитесь к администратору.");
                break;
            case "Request failed with status code 500":
                messageService.sendError("Внутренняя ошибка сервера. Обратитесь к администратору.");
                break;
            case `timeout of ${GlobalConstants.RequestTimeout}ms exceeded`:
                messageService.sendError("Сервер не ответил.");
                break;
            default:
                messageService.sendError("В процессе авторизации возникла проблема.");
                break;
        }
    }

    async function tryConnect() {
        if (!validateInput()) return;
        setIsLoading(true);
        try {
            messageService.clearMessages();
            let api = new VacAPI();
            let result = await api.getConnection(loginValue, passValue);
            if (!result.data) {
                handleErrors(result);
                return;
            }
            SettingsManager.setConnectionCredentials({ login: loginValue, token: result.data?.token });
            messageService.sendSuccess("Вы подключены!");
            setActivePivot(GlobalConstants.ActivePivotVacationListValue);
        }
        catch (e) {
            messageService.sendError((e as Error).message);
        }
        finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        setIsLoading(false);
    });

    return (
        <div className="app-connection">
            <Stack>
                {isLoading && <Loader />}  
                <SeparatorTitle text="Добро пожаловать!" />
                <div className="connection-authorization">
                    <TextField
                        required
                        className="connection-input-login"
                        onChange={(_, newValue?: string) => setLoginValue(newValue ?? "")}
                        placeholder="Логин"
                    />
                    <TextField
                        required
                        canRevealPassword
                        className="connection-input-login"
                        onChange={(_, newValue?: string) => setPassValue(newValue ?? "")}
                        placeholder="Пароль"
                        revealPasswordAriaLabel="Показать пароль"
                        type="password"
                    />
                    <PrimaryButton
                        allowDisabledFocus
                        className="connection-input-connect"
                        onClick={tryConnect}
                        text="Подключение"
                    />
                </div>
            </Stack>
        </div>
    );
};

export { ConnectionForm };