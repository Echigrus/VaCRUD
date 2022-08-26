import * as React from "react";
import { Spinner, SpinnerSize } from "@fluentui/react";

type TProps = {
    isFullSize?: boolean;
};

const Loader = ({ isFullSize = true }: TProps): JSX.Element => (
    <Spinner size={SpinnerSize.large} className={`vacrud-loader ${isFullSize ? "full" : ""}`} />
);

export { Loader };