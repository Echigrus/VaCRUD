import * as React from "react";
import { CommandBar, ICommandBarItemProps } from "@fluentui/react";
import { GlobalConstants } from "../../constants/global";
import { SettingsManager } from "../../classes/settings-manager";
import { NotificationBar } from "./notification-bar";

type TProps = {
    selectedKey: string;
    setSelectedKey: React.Dispatch<React.SetStateAction<string>>;
    isConnect: boolean;
};

const AppHeader = ({ isConnect, selectedKey, setSelectedKey }: TProps): JSX.Element => {
    const _items: ICommandBarItemProps[] = [
        {
            key: "VacationList",
            iconProps: { iconName: "FormLibrary" },
            text: "Мои отпуска",
            iconOnly: true,
            checked: selectedKey === GlobalConstants.ActivePivotVacationListValue,
            onClick: () => setSelectedKey(GlobalConstants.ActivePivotVacationListValue),
        }
    ];

    const _connectedFarItems: ICommandBarItemProps[] = [
        {
            key: "Logout",
            iconProps: { iconName: "SignOut" },
            text: `Закрыть сессию (учётная запись: ${(SettingsManager.getConnectionCredentials()?.login || "-")})`,
            iconOnly: true,
            checked: selectedKey === GlobalConstants.ActivePivotLogoutValue,
            onClick: () => setSelectedKey(GlobalConstants.ActivePivotLogoutValue),
        }
    ];

    const _farItems: ICommandBarItemProps[] = [
        {
            key: "Connection",
            iconProps: { iconName: "PlugConnected" },
            text: "Подключение",
            iconOnly: true,
            checked: selectedKey === GlobalConstants.ActivePivotConnectionValue,
            onClick: () => setSelectedKey(GlobalConstants.ActivePivotConnectionValue),
        }
    ];

    return (
        <div id="vacrud-app-header">
            <CommandBar items={isConnect ? _items : []} farItems={isConnect ? _connectedFarItems : _farItems} />
            <NotificationBar />
        </div>
    );
};

export { AppHeader };
