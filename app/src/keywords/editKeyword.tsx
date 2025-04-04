

import { Button, FormGroup, TextField } from "@mui/material";
import { ChangeEvent, useContext, useState } from "react";
import { IKeyword } from "./IKeyword";
import { Helpers } from "../helpers";
import { ProgressContext } from "../progress/progressModalContainer";

interface EditKeywordFormProps {
    onEdited: () => void;
    initialValues: IKeyword;
    updateKeyword: (name: string, expression: string, ports: string) => void;
}

//https://github.com/kierenholt/curfew/blob/groups-users-requests-full-db/app/src/QuotaEditForm.tsx

export function EditKeyword(props: EditKeywordFormProps) {
    const [name, setName] = useState<string>(props.initialValues.name);
    const [expression, setExpression] = useState<string>(props.initialValues.expression);
    const [ports, setPorts] = useState<string>(props.initialValues.ports);
    const progressContext = useContext(ProgressContext);

    const save = () => {
        let nonce: number = Helpers.createNonce();
        Helpers.put<number>(`/api/keyword/${props.initialValues.id}`,
            {
                keyword: { name: name, expression: expression, ports: ports, 
                    isActive: props.initialValues.isActive },
                nonce: nonce
            })
            .then((updated: number) => {
                if (updated > 0) {
                    progressContext.setNonce(nonce);
                    progressContext.setOnSuccess(() => {
                        props.updateKeyword(name, expression, ports);
                        props.onEdited();
                    });
                    progressContext.setOpen(true);
                }
                else {
                    throw ("error communicating with server");
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

            <TextField
                id="ports"
                label="ports"
                helperText="comma separated list of port numbers"
                variant="standard"
                value={ports}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setPorts(e.target.value);
                }}
            />

            <Button onClick={save} >Save</Button>
            <Button onClick={() => props.onEdited()} >Cancel</Button>

        </FormGroup>
    )
}