import { Button, Checkbox, FormControlLabel, FormGroup, TextField, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";
import { Helpers } from "./helpers";
import { Typography } from "@mui/joy";
import { IUserGroup } from "./types";

interface GroupEditFormProps {
    onCreated: () => void;
    groupId: number;
}

export function GroupEditForm(props: GroupEditFormProps) {
    const [name, setName] = useState<string>("");
    const [isUnrestricted, setIsUnrestricted] = useState<boolean>(false);
    
    useEffect(() => {
        Helpers.get<IUserGroup>(`/api/userGroups/${props.groupId}`)
            .then((group: IUserGroup) => {
                setName(group.name);
                setIsUnrestricted(group.isUnrestricted);
            })
    }, [props.groupId])

    const save = () => {
        if (props.groupId > 0 && name)
            Helpers.put<number>(`/api/userGroups/${props.groupId}`, 
            { name: name, isUnrestricted: isUnrestricted })
                .then((updated: number) => {
                    if (updated > 0) {
                        props.onCreated();
                    }
                })
    }

    return (
        <FormGroup>
            <TextField
                id="Group-name"
                label="Name"
                helperText="e.g. Kids"
                variant="standard"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setName(e.target.value);
                }}
            />

                <FormControlLabel control={
                    <Checkbox onChange={(e) => setIsUnrestricted(e.target.checked)} 
                        checked={isUnrestricted}/>
                } label="Unrestricted access*" />

            <Typography id="" component="p">
                *Can access any app at any time, regardless of quotas and limits.
                It is recommended to enable for adults only.
            </Typography>

            <Button onClick={save} >Save</Button>
        </FormGroup>
    )
}