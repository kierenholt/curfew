import { FormControlLabel, Switch } from "@mui/material";
import { useEffect, useState } from "react";
import { Helpers } from "./helpers";
import { IDevice } from "./types";

export interface DeviceSetBanProps {
    deviceId: string;
}

export const DeviceBanSwitch = (props: DeviceSetBanProps) => {
    const [isBanned, setIsBanned] = useState(false);
    const [name, setName] = useState("");

    useEffect(() => {
        Helpers.get<IDevice>(`/api/devices/${props.deviceId}`)
        .then((device: IDevice) => {
            setIsBanned(device.isBanned);
            setName(device.name);
        })
    })

    const setDeviceBan = (value: boolean) => {
        Helpers.put<number>(`/api/devices/${props.deviceId}/isBanned=${value ? 1 : 0}`, {})
            .then((updated: number) => {
                if (updated > 0) {
                    setIsBanned(value);
                }
            })
    }

    return (
        <FormControlLabel control={
            <Switch 
                checked={isBanned}
                onChange={
                    (event: React.ChangeEvent<HTMLInputElement>) => {
                        setDeviceBan(event.target.checked);
                    }
                }/>
        } label={name} />
    )
}