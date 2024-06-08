import { ToggleButton, Tooltip } from "@mui/material";
import { IDevice } from "./types";
import { useState } from "react";
import { BanIcon } from "./Icon";
import { Helpers } from "./helpers";


interface DeviceBanToggleButtonProps {
    device: IDevice;
}

export const DeviceBanToggleButton = (props: DeviceBanToggleButtonProps) => {
    const [isBanned, setIsBanned] = useState<boolean>(props.device.isBanned);

    const apply = (deviceId: string, value: boolean) => {
        Helpers.put<number>(`/api/devices/${deviceId}/isBanned=${value ? 1 : 0}`, {})
            .then((updated: number) => {
                if (updated > 0) {
                    setIsBanned(value);
                }
            })
    }

    return (
        <Tooltip title={isBanned ? "click to unban" : "click to ban"}>
            <ToggleButton
                value="ban"
                selected={isBanned}
                onChange={() => {
                    apply(props.device.id, !isBanned);
                }}
            >
                <BanIcon />
            </ToggleButton>
        </Tooltip>
    )

}