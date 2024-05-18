import { Button, TextField } from "@mui/material";
import { ChangeEvent, useState } from "react";
import { UserSelect } from "./UserSelect";
import { Helpers } from "./helpers";

interface DeviceCreateFormProps {
    MAC: string;
    onCreated: () => void;
}

export function DeviceCreateForm(props: DeviceCreateFormProps) {
    const [name, setName] = useState<string>("");
    const [ownerId, setOwnerId] = useState<number>(0);

    const save = () => {
        if (props.MAC && name && ownerId > 0)
        Helpers.post<string>(`/api/devices/`, {mac: props.MAC, name: name, ownerId: ownerId})
            .then((deviceMAC: string) => console.log(deviceMAC))
    }

    return (
        <>
            <TextField
                id="device-name"
                label="device name"
                defaultValue=""
                helperText="e.g. Grey Ipad"
                variant="standard"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setName(e.target.value);
                }}
            />

            <UserSelect onSelect={(id: number) => setOwnerId(id)} />

            <Button onClick={save} >Save</Button>
        </>
    )
}