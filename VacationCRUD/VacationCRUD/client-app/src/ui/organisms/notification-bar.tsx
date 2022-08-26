import { MessageBar } from "@fluentui/react";
import * as React from "react";
import { Subscription } from "rxjs";
import { messageService } from '../../classes/message-service';
import { GlobalConstants } from "../../constants/global";
import { TNotification } from "../../types/notification";

type State = {
    items: Array<TNotification>;
}

class NotificationBar extends React.Component<{}, State> {
    subscription?: Subscription;
    constructor(props: {}) {
        super(props);

        this.state = {
            items: new Array<TNotification>()
        }
    }

    componentDidMount() {
        this.subscription = messageService.getMessage().subscribe(
            (value: TNotification | null) => {
                if (value == null) {
                    this.setState({ items: new Array<TNotification>() });
                }
                else {
                    this.setState({
                        items: this.state.items.concat(value)
                    })
                }
        });
    }

    componentWillUnmount() {
        this.subscription?.unsubscribe();
    }

    delMessage(id: number) {
        this.setState((prevState: State) => ({
            items: prevState.items.filter((_, index) => index != id)
        }));
    }

    render() {
        const { items } = this.state;
        if (items.length == 0) return (null);

        let messages: JSX.Element[];
        let truncate: boolean;
        messages = items.map(
            (message, index) => {
                truncate = message.text.length >= GlobalConstants.OverflowCharLimit;
                return (
                    <MessageBar
                        key={"mb_" + index}
                        messageBarType={message.type}
                        isMultiline={false}
                        className="app-notification"
                        onDismiss={() => this.delMessage(index)}
                        dismissButtonAriaLabel="Закрыть"
                        truncated={truncate}
                        overflowButtonAriaLabel="Подробнее"
                    >
                        {message.text}
                    </MessageBar>
                );
            }
        );
        return (
            <div id="app-notificationbar">
                {messages}
            </div>
        );
    }
}

export { NotificationBar };