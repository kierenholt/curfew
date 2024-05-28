import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useEffect, useState } from "react";
import { Helpers } from "./helpers";
import { IDevice } from "./types";

export interface DeviceSelectProps {
    selectedDeviceId: string;
    setSelectedDeviceId: (n: string) => void;
}

export function DeviceSelect(props: DeviceSelectProps) {
    const [devices, setDevices] = useState<IDevice[]>([]);

    useEffect(() => {
        Helpers.get<IDevice[]>("/api/devices/")
            .then((Devices: IDevice[]) => {
                setDevices(Devices)
        })
    }, []);

    const handleChange = (event: SelectChangeEvent) => {
        props.setSelectedDeviceId(event.target.value);
      };

    return (
        <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Device</InputLabel>
            <Select
                labelId="Device-select-label"
                id="Device-select"
                label="Device"
                value={props.selectedDeviceId}
                onChange={handleChange}
            >
                {devices.map(g => 
                    <MenuItem value={g.id}>{g.name}</MenuItem>
                )}
            </Select>
        </FormControl>
    )
}