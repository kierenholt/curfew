import { Button, Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { useEffect, useState } from "react";
import { Helpers } from "../helpers";
import { ISetting } from "./ISetting";

interface SettingEditFormAsBooleanProps {
    onEdited: () => void;
    settingKey: number;
}

export function SettingEditFormAsBoolean(props: SettingEditFormAsBooleanProps) {
    const [value, setValue] = useState<boolean>(false);
    const [label, setLabel] = useState<string>("");
    const [description, setDescription] = useState<string>("");

    useEffect(() => {
        Helpers.get<ISetting>(`/api/settings/${props.settingKey}`)
            .then((Setting: ISetting) => {
                setValue(Setting.value === "true");
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

                <FormControlLabel control={
                    <Checkbox onChange={(e) => setValue(e.target.checked)}
                        checked={value} />
                } label={label} />
                <p>{description}</p>

                <Button onClick={save} >Save</Button>
            </FormGroup>
        </>
    )
}