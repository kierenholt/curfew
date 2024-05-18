import { Button, TextField, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { ChangeEvent, useState } from "react";
import { Helpers } from "./helpers";
import { GroupSelect } from "./GroupSelect";
import { Typography } from "@mui/joy";

interface GroupCreateFormProps {
    onCreated: () => void;
}

export function GroupCreateForm(props: GroupCreateFormProps) {
    const [name, setName] = useState<string>("");
    const [isUnrestricted, setIsUnrestricted] = useState<boolean>(false);

    const save = () => {
        if (name)
            Helpers.post<string>(`/api/groups/`, { name: name, isUnrestricted: isUnrestricted })
                .then((GroupId: string) => console.log(GroupId))
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

            <Button onClick={save} >Save</Button>
        </>
    )
}