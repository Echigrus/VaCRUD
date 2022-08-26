import * as React from "react";
import { Text } from "@fluentui/react/lib/Text";
import { Separator } from "@fluentui/react";

type SeparatorTitleProps = {
    text: string;
    className?: string;
};

const SeparatorTitle = ({ text, className }: SeparatorTitleProps): JSX.Element => (
    <Separator alignContent='center' className={`separator-title ${className}`}>
        <Text variant="mediumPlus" nowrap block>
            {text}
        </Text>
    </Separator>
);

export { SeparatorTitle };
