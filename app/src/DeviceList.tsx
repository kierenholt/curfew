import { List } from "@mui/joy";
import { IDevice } from "./types";
import { DeviceListItem } from "./DeviceListItem";

export interface DeviceListProps {
    initialDevices: IDevice[];
}

export function DeviceList(props: DeviceListProps) {

    return (
        <List>
            {props.initialDevices.map((g: IDevice) => <DeviceListItem device={g} />)}
        </List>
    )
}