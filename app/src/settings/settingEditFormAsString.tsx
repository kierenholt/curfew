import { Button, Checkbox, FormControlLabel, FormGroup, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { Helpers } from "../helpers";
import { ISetting } from "./ISetting";
import Typography from "@mui/joy/Typography";

interface SettingEditFormAsStringProps {
    onEdited: () => void;
    settingKey: number;
}

export function SettingEditFormAsString(props: SettingEditFormAsStringProps) {
    const [value, setValue] = useState<string>("");
    const [label, setLabel] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [warningMessage, setWarningMessage] = useState<string>("");

    useEffect(() => {
        Helpers.get<ISetting>(`/api/settings/${props.settingKey}`)
            .then((setting: ISetting) => {
                setValue(setting.value);
                setLabel(setting.label);
                setDescription(setting.description);
                setWarningMessage(setting.warningMessage);
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
            <FormGroup>
                <TextField
                    id="setting"
                    label={label}
                    helperText={description}
                    variant="standard"
                    value={value}
                    onChange={(e: any) => setValue(e.target.value)}
                />

                {
                    warningMessage == ""
                        ?
                        <></>
                        :
                        <Typography sx={{color:"red"}}>
                            props.warningMessage
                        </Typography>
                }

                <Button onClick={save} >Save</Button>
                <Button onClick={() => props.onEdited()} >Cancel</Button>
            </FormGroup>
        </>
    )
}