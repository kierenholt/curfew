import { Button, FormGroup, TextField, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { ChangeEvent, useState } from "react";
import { Helpers } from "./helpers";
import { FilterAction } from "./types";
import { GroupSelect } from "./GroupSelect";

interface FilterCreateFormProps {
    onCreated: () => void;
    component?: string;
    groupId?: number;
}

export function FilterCreateForm(props: FilterCreateFormProps) {
    const [component, setComponent] = useState<string>(props.component ? props.component : "");
    const [action, setAction] = useState<FilterAction>(FilterAction.alwaysAllow);
    const [groupId, setGroupId] = useState<number>(props.groupId ? props.groupId : 1);

    const save = () => {
        if (component)
            Helpers.post<number>(`/api/filters/`,
                {
                    component: component,
                    action: action,
                    groupId: groupId
                })
                .then((filterId: number) => {
                    if (filterId > 0) {
                        props.onCreated();
                    }
                })
    }

    return (
        <FormGroup>
            <TextField
                id="component"
                label=""
                defaultValue=""
                helperText="search text e.g. whatsapp"
                variant="standard"
                value={component}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setComponent(e.target.value);
                }}
            />

            <ToggleButtonGroup
                color="primary"
                value={action}
                exclusive
                onChange={(e: any, value: any) => {
                    if (value !== null) {
                        setAction(value);
                    }
                }}
                aria-label="filter action"
            >
                <ToggleButton value={FilterAction.alwaysAllow}>Always allow</ToggleButton>
                <ToggleButton value={FilterAction.alwaysDeny}>Always deny</ToggleButton>
                <ToggleButton value={FilterAction.needsBooking}>Allow during bookings</ToggleButton>
            </ToggleButtonGroup>

            <GroupSelect setSelectedGroupId={setGroupId} selectedGroupId={groupId} />

            <Button onClick={save} >Save</Button>
        </FormGroup>
    )
}