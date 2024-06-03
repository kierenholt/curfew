import { Button, Checkbox, FormControlLabel, FormGroup, TextField } from "@mui/material";
import { ChangeEvent, useState } from "react";
import { Helpers } from "./helpers";
import { GroupSelect } from "./GroupSelect";

interface UserCreateFormProps {
    onCreated: () => void;
}

export function UserCreateForm(props: UserCreateFormProps) {
    const [name, setName] = useState<string>("");
    const [groupId, setGroupId] = useState<number>(0);
    const [isAdministrator, setIsAdministrator] = useState<boolean>(false);

    const save = () => {
        if (name && groupId > 0)
            Helpers.post<number>(`/api/users/`,
                {
                    name: name,
                    groupId: groupId,
                    isAdministrator: isAdministrator
                })
                .then((userId: number) => {
                    if (userId > 0) {
                        props.onCreated();
                    }
                })
    }

    return (
        <FormGroup>
            <TextField
                id="User-name"
                label="Name"
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