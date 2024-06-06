import { Button, FormGroup, TextField, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";
import { Helpers } from "./helpers";
import { FilterAction, IFilter } from "./types";

interface FilterEditFormProps {
    onEdited: () => void;
    id: number;
}

export function FilterEditForm(props: FilterEditFormProps) {
    const [component, setComponent] = useState<string>("");
    const [action, setAction] = useState<FilterAction>(FilterAction.alwaysAllow);
    const [groupId, setGroupId] = useState<number>(0);

    useEffect(() => {
        Helpers.get<IFilter>(`/api/filters/${props.id}`)
            .then((filter: IFilter) => {
                setComponent(filter.component);
                setAction(filter.action);
                setGroupId(filter.groupId)
            })
    }, [props.id])

    const save = () => {
        if (props.id > 0)
            Helpers.put<number>(`/api/filters/${props.id}`,
                {
                    component: component, action: action.valueOf(), groupId: groupId
                })
                .then((updated: number) => {
                    if (updated > 0) {
                        props.onEdited();
                    }
                })
    }

    return (
        <>
            <p>
                update filter
            </p>
            <FormGroup>
                <TextField
                    id="component"
                    label=""
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
                    <ToggleButton value={FilterAction.needsBooking}>Only when booked</ToggleButton>
                </ToggleButtonGroup>

                <Button onClick={save} >Save</Button>
            </FormGroup>
        </>
    )
}