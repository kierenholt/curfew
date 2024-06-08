import { Button, FormGroup, TextField } from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";
import { Helpers } from "./helpers";
import { ISetting } from "./types";

interface SettingEditFormAsNumberProps {
    onEdited: () => void;
    settingKey: number;
}

export function SettingEditFormAsNumber(props: SettingEditFormAsNumberProps) {
    const [value, setValue] = useState<string>("");
    const [label, setLabel] = useState<string>("");
    const [description, setDescription] = useState<string>("");

    useEffect(() => {
        Helpers.get<ISetting>(`/api/settings/${props.settingKey}`)
            .then((Setting: ISetting) => {
                setValue(Setting.value);
                setLabel(Setting.label);
                setDescription(Setting.description);
            })
    }, [props.settingKey])

    const save = () => {
        if (props.settingKey > 0)
            Helpers.put<number>(`/api/settings/${props.settingKey}`,
                {
                    value: value.toString() //send as string
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
                update Setting
            </p>
            <FormGroup>
                <TextField
                    id="value"
                    label={label}
                    helperText=""
                    variant="standard"
                    value={value}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setValue(e.target.value);
                    }}
                />
                <p>{description}</p>

                <Button onClick={save} >Save</Button>
            </FormGroup>
        </>
    )
}