import { Button, Checkbox, FormControlLabel, FormGroup, TextField } from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";
import { Helpers } from "./helpers";
import { IUser } from "./types";
import { GroupSelect } from "./GroupSelect";

interface UserEditFormProps {
    onEdited: () => void;
    userId: number;
}

export function UserEditForm(props: UserEditFormProps) {
    const [name, setName] = useState<string>("");
    const [groupId, setGroupId] = useState<number>(0);
    const [isAdministrator, setIsAdministrator] = useState<boolean>(false);

    useEffect(() => {
        Helpers.get<IUser>(`/api/users/${props.userId}`)
            .then((user: IUser) => {
                setName(user.name);
                setGroupId(user.groupId);
                setIsAdministrator(user.isAdministrator);
            })
    }, [props.userId])

    const save = () => {
        if (props.userId > 0 && name && groupId > 0)
            Helpers.put<number>(`/api/users/${props.userId}`,
                {
                    name: name,
                    groupId: groupId,
                    isAdministrator: isAdministrator
                })
                .then((updated: number) => {
                    if (updated > 0) {
                        props.onEdited();
                    }
                })
    }

    return (

        <FormGroup>
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

            <GroupSelect setSelectedGroupId={setGroupId} selectedGroupId={groupId} />

            <FormControlLabel control={
                <Checkbox onChange={(e) => setIsAdministrator(e.target.checked)}
                    checked={isAdministrator} />
            } label="Administrator" />

            <Button onClick={save} >Save</Button>
        </FormGroup>
    )
}