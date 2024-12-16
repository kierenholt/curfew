

import { Button, Checkbox, FormControlLabel, FormGroup, TextField } from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";
import { IKeyword } from "../types";
import { Helpers } from "../helpers";

interface EditKeywordFormProps {
    onEdited: () => void;
    initialValues: IKeyword;
    updateKeyword: (name: string, expression: string) => void;
}

//https://github.com/kierenholt/curfew/blob/groups-users-requests-full-db/app/src/QuotaEditForm.tsx

export function EditKeyword(props: EditKeywordFormProps) {
    const [name, setName] = useState<string>(props.initialValues.name);
    const [expression, setExpression] = useState<string>(props.initialValues.expression);

    const save = () => {
        Helpers.put<number>(`/api/keyword/${props.initialValues.id}`, {name: name, expression: expression})
            .then((updated: number) => {
                if (updated > 0) {
                    props.updateKeyword(name, expression);                    
                    props.onEdited();
                }
            })
    }

    return (
        <FormGroup>
            <TextField
                id="name"
                label="name"
                helperText="just the name that appears in the list"
                variant="standard"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setName(e.target.value);
                }}
            />

            <TextField
                id="expression"
                label="search terms"
                helperText="comma separated list of words to match to domain names"
                variant="standard"
                value={expression}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setExpression(e.target.value);
                }}
            />

            <Button onClick={save} >Save</Button>
            <Button onClick={() => props.onEdited()} >Cancel</Button>

        </FormGroup>
    )
}