import { Button, TextField } from "@mui/material";
import { ChangeEvent, useState } from "react";
import { UserSelect } from "./UserSelect";
import { Helpers } from "./helpers";

interface DeviceCreateFormProps {
    id: string;
    onCreated: () => void;
}

export function DeviceCreateForm(props: DeviceCreateFormProps) {
    const [name, setName] = useState<string>("");
    const [ownerId, setOwnerId] = useState<number>(0);

    const save = () => {
        if (props.id && name && ownerId > 0)
        Helpers.post<string>(`/api/devices/`, {id: props.id, name: name, ownerId: ownerId})
            .then((deviceid: string) => {
                if (deviceid.length === 12) {
                    props.onCreated();
                }
            });
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

            <UserSelect selectedUserId={ownerId} setSelecterUserId={setOwnerId} />

            <Button onClick={save} >Save</Button>
        </>
    )
}