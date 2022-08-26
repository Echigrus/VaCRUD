import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { messageService } from "../../classes/message-service";
import { SettingsManager } from "../../classes/settings-manager";
import { GlobalConstants } from "../../constants/global";
import { AppHeader } from "../organisms/app-header";
import { ConnectionForm } from "../organisms/connection-form";
import { Logout } from "../organisms/logout";
import { VacationListForm } from "../organisms/vacation-list-form";

type AppProps = {
    activePivot: string;
}

const App = ({ activePivot }: AppProps): JSX.Element => {
    const [selectedKey, setSelectedKey] = useState(activePivot ?? GlobalConstants.ActivePivotConnectionValue);
    const [isConnect, setIsConnect] = useState(false);
    const oldSelectedKey = useRef<string>("");

    function getBody(): JSX.Element {
        if (oldSelectedKey.current != selectedKey) {
            messageService.clearMessages();
        }
        let body = <ConnectionForm setActivePivot={setSelectedKey} />;
        switch (selectedKey) {
            case GlobalConstants.ActivePivotConnectionValue: {
                body = <ConnectionForm setActivePivot={setSelectedKey} />;
                break;
            }
            case GlobalConstants.ActivePivotVacationListValue: {
                body = <VacationListForm setActivePivot={setSelectedKey} />;
                break;
            }
            case GlobalConstants.ActivePivotLogoutValue: {
                body = <Logout setActivePivot={setSelectedKey} />;
                break;
            }
        }
        oldSelectedKey.current = selectedKey;
        return body;
    }

    function checkConnection() {
        const creds = SettingsManager.getConnectionCredentials();
        if (creds?.token) {
            setIsConnect(true);
        }
        else {
            setIsConnect(false);
        }
    }

    useEffect(() => {
        checkConnection();
    });

    return (
        <div>
            <AppHeader selectedKey={selectedKey} setSelectedKey={setSelectedKey} isConnect={isConnect} />
            <div id="vacrud-app-content">
                {getBody()}
            </div>
        </div>
    );
};

export { App };