import { MessageBarType } from "@fluentui/react";
import { Subject } from "rxjs";
import { TNotification } from "../types/notification";

const subject = new Subject<TNotification | null>();

export const messageService = {
    sendMessage: (value: TNotification) => {
        subject.next(value)
    },
    sendError: (message: string) => {
        subject.next({ type: MessageBarType.error, text: message })
    },
    sendInfo: (message: string) => {
        subject.next({ type: MessageBarType.info, text: message })
    },
    sendSuccess: (message: string) => {
        subject.next({ type: MessageBarType.success, text: message })
    },
    clearMessages: () => subject.next(null),
    getMessage: () => subject.asObservable()
};