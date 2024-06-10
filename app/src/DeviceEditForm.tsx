import { Button, FormGroup, TextField } from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";
import { Helpers } from "./helpers";
import { IDevice } from "./types";
import { UserSelect } from "./UserSelect";

interface DeviceEditFormProps {
    onEdited: () => void;
    id: string
}

export function DeviceEditForm(props: DeviceEditFormProps) {
    const [name, setName] = useState<string>("");
    const [ownerId, setOwnerId] = useState<number>(0);

    useEffect(() => {
        Helpers.get<IDevice>(`/api/devices/${props.id}`)
            .then((Device: IDevice) => {
                setName(Device.name);
                setOwnerId(Device.ownerId);
            })
    },[props.id])

    const save = () => {
        if (props.id && name && ownerId > 0)
        Helpers.put<number>(`/api/devices/${props.id}`, {name: name, ownerId: ownerId})
            .then((updated: number) => {
                if (updated > 0) {
                    props.onEdited();
                }
            });

    }

    return (
        <FormGroup>
            <TextField
                id="Device-name"
                label="Name"
                helperText="e.g. Arthur"
                variant="standard"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setName(e.target.value);
                }}
            />

            <UserSelect selectedUserId={ownerId} setSelectedUserId={setOwnerId} />
            <Button onClick={save} >Save</Button>
            <Button onClick={() => props.onEdited()} >Cancel</Button>
        </FormGroup>
    )
}