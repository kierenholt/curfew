import { Button, FormGroup, TextField } from "@mui/material";
import { ChangeEvent, useState } from "react";
import { Helpers } from "../helpers";

interface CreateKeywordFormProps {
    onCreated: () => void;
    createKeywordId: () => void;
}

export function CreateKeyword(props: CreateKeywordFormProps) {
    const [name, setName] = useState<string>("");
    const [expression, setExpression] = useState<string>("");

    const save = () => {
        Helpers.post<number>(`/api/keywords`,
            {
                name: name, expression: expression, isActive: 0
            })
            .then((updated: number) => {
                if (updated > 0) {
                    props.createKeywordId();
                    props.onCreated();
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
                placeholder="tiktok"
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
                placeholder="tiktokv,tiktokcdn"
                value={expression}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setExpression(e.target.value);
                }}
            />

            <Button onClick={save} >Create</Button>
            <Button onClick={() => props.onCreated()} >Cancel</Button>

        </FormGroup>
    )
}