import { useEffect, useState } from "react";
import { Helpers } from "../helpers";
import { ISetting } from "./ISetting";
import { SettingList } from "./settingList";
import { Button } from "@mui/material";

export function ManageSettingsPage() {
    const [settings, setSettings] = useState<ISetting[]>([]);
    useEffect(() => {
        Helpers.get<ISetting[]>(`/api/settings`)
            .then((settings: ISetting[]) => {
                setSettings(settings)
            })
    }, [])

    const shutdown = () => {
        Helpers.delete('/api/settings/shutdown');
    }

    return (
        <>
            <h2>
                Settings
            </h2>
            <SettingList settings={settings} />
            <Button onClick={shutdown} >
                Shutdown
            </Button>
        </>
    )
}