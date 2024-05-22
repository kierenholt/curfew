import { Button, Checkbox, FormControlLabel, FormGroup, TextField } from "@mui/material";
import { ChangeEvent, useState } from "react";
import { Helpers } from "./helpers";
import { Typography } from "@mui/joy";

interface GroupCreateFormProps {
    onCreated: () => void;
}

export function GroupCreateForm(props: GroupCreateFormProps) {
    const [name, setName] = useState<string>("");
    const [isUnrestricted, setIsUnrestricted] = useState<boolean>(false);

    const save = () => {
        if (name)
            Helpers.post<number>(`/api/userGroups/`, { name: name, isUnrestricted: isUnrestricted })
                .then((groupId: number) => {
                    if (groupId > 0) {
                        props.onCreated();
                    }
                })
    }

    return (
        <FormGroup>
            <TextField
                id="Group-name"
                label="Name"
                defaultValue=""
                helperText="e.g. Kids"
                variant="standard"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setName(e.target.value);
                }}
            />


            <FormControlLabel control={
                <Checkbox onChange={(e) => setIsUnrestricted(e.target.checked)}
                    checked={isUnrestricted} />
            } label="Unrestricted access*" />

            <Typography id="" component="p">
                Unrestricted access to websites and apps.
                It is recommended to enable for adults only.
            </Typography>

            <Button onClick={save} >Save</Button>
        </FormGroup>
    )
}