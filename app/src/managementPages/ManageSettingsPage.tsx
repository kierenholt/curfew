import { useEffect, useState } from "react";
import { SettingList } from "../SettingList";
import { ISetting } from "../types";
import { Helpers } from "../helpers";

export interface ManageSettingsProps {
    
}

export function ManageSettingsPage() {
    const [settings, setSettings] = useState<ISetting[]>([]);
    useEffect(() => {
        Helpers.get<ISetting[]>(`/api/settings`)
            .then((settings: ISetting[]) => {
                setSettings(settings)
            })
    }, [])

    return (
        <>
            <p>
                list of Settings
            </p>
            <SettingList settings={settings} />
        </>
    )
}