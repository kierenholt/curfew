import { Button, TextField, ToggleButton, ToggleButtonGroup } from "@mui/material";
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
            Helpers.put<number>(`/api/userGroups/${props.groupId}`, { name: name, isUnrestricted: isUnrestricted })
                .then((updated: number) => {
                    if (updated > 0) {
                        props.onCreated();
                    }
                })
    }

    return (
        <>
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

            <ToggleButtonGroup
                color="primary"
                value={isUnrestricted}
                exclusive
                onChange={(e: any, value: any) => {
                    if (value !== null) {
                        setIsUnrestricted(value);
                    }
                }}
                aria-label="Is unrestricted"
            >
                <ToggleButton value={false}>Restricted</ToggleButton>
                <ToggleButton value={true}>Unrestricted</ToggleButton>
            </ToggleButtonGroup>
            <Typography id="" component="p">
                Unrestricted access to websites and apps.
                It is recommended to enable for adults only.
            </Typography>

            <Button onClick={save} >Update</Button>
        </>
    )
}