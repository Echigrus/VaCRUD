import { useEffect } from "react";
import * as React from "react";
import { messageService } from "../../classes/message-service";
import { SettingsManager } from "../../classes/settings-manager";
import { GlobalConstants } from "../../constants/global";
import { Loader } from "../atoms/loader";
import { VacAPIManager } from "../../classes/vac-api-manager";

type TProps = {
    setActivePivot: React.Dispatch<React.SetStateAction<string>>;
}

const Logout = ({ setActivePivot }: TProps): JSX.Element => {
    async function logout() {
        const creds = SettingsManager.getConnectionCredentials();
        if(creds?.token) {
            try {
                await VacAPIManager.request<any>(async (api) => {
                    return await api.logout();
                });
                SettingsManager.clearConnectionCredentials();
            }
            finally {
                messageService.sendInfo("Сессия закрыта.");
            }
        }
        SettingsManager.clearConnectionCredentials();
        setActivePivot(GlobalConstants.ActivePivotConnectionValue);
    }

    useEffect(() => {
        logout();
    });
    
    return (<Loader isFullSize={true}/>);
};

export { Logout };