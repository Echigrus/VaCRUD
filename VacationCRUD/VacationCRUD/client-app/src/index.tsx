import { initializeIcons, ThemeProvider } from "@fluentui/react";
import * as React from "react";
import './index.css';
import { createRoot } from "react-dom/client";
import { GlobalConstants } from "./constants/global";
import { Loader } from './ui/atoms/loader';
import { App } from './ui/pages/app';

initializeIcons();

export const render = (isLoading: boolean = false) => {
    const container = document.getElementById(GlobalConstants.MainRoot);
    const root = createRoot(container as HTMLElement);
    const urlParams = new URLSearchParams(window.location.search);
    root.render(
        <ThemeProvider>
            {isLoading ?
                <Loader isFullSize={true} />
                :
                <App activePivot={urlParams.get(GlobalConstants.ActivePivotParam) ?? ""} />
            }
        </ThemeProvider>
    );
};

render();