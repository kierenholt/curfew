import { Button, TextField } from "@mui/material";
import { ChangeEvent, useState } from "react";
import { Helpers } from "./helpers";
import { GroupSelect } from "./GroupSelect";

interface UserCreateFormProps {
    onCreated: () => void;
}

export function UserCreateForm(props: UserCreateFormProps) {
    const [name, setName] = useState<string>("");
    const [userId, setUserId] = useState<number>(0);

    const save = () => {
        if (name && userId > 0)
        Helpers.post<string>(`/api/users/`, {name: name, groupId: userId})
            .then((userId: string) => console.log(userId))
    }

    return (
        <>
            <TextField
                id="User-name"
                label="Name"
                defaultValue=""
                helperText="e.g. Arthur"
                variant="standard"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setName(e.target.value);
                }}
            />

            <GroupSelect initialGroupId={0}
                onSelect={(id: number) => setUserId(id)} />

            <Button onClick={save} >Save</Button>
        </>
    )
}