import { Button, TextField } from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";
import { Helpers } from "./helpers";
import { IDevice } from "./types";
import { UserSelect } from "./UserSelect";

interface DeviceEditFormProps {
    onEdited: () => void;
    mac: string
}

export function DeviceEditForm(props: DeviceEditFormProps) {
    const [name, setName] = useState<string>("");
    const [ownerId, setOwnerId] = useState<number>(0);

    useEffect(() => {
        Helpers.get<IDevice>(`/api/devices/${props.mac}`)
            .then((Device: IDevice) => {
                setName(Device.name);
                setOwnerId(Device.ownerId);
            })
    })

    const save = () => {
        if (props.mac && name && ownerId > 0)
        Helpers.put<number>(`/api/devices/${props.mac}`, {name: name, ownerId: ownerId})
            .then((updated: number) => console.log(updated))
    }

    return (
        <>
            <TextField
                id="Device-name"
                label="Name"
                defaultValue=""
                helperText="e.g. Arthur"
                variant="standard"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setName(e.target.value);
                }}
            />

            <UserSelect initialUserId={ownerId}
                onSelect={(id: number) => setOwnerId(id)} />

            <Button onClick={save} >Save</Button>
        </>
    )
}