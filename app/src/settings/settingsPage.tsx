import { useEffect, useState } from "react";
import { Helpers } from "../helpers";
import { ISetting } from "./ISetting";
import { SettingList } from "./settingList";

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
            <h2>
                Settings
            </h2>
            <SettingList settings={settings} />
        </>
    )
}