import { useContext } from "react";
import { PageContext } from "../pageSelector/pageSelector";
import { SettingEditFormAsString } from "./settingEditFormAsString";

export interface EditSettingPageProps {
    settingKey: number //key
}

export function EditSettingPage(props: EditSettingPageProps) {
    const pageContext = useContext(PageContext);
    const settingIsStoredAsNumber: any = {
        1: false, //routerAdminPassword = 1,
        2: false, //lanIp = 2,
        3: false, //pin = 3
    };

    return (
        <>
            <SettingEditFormAsString
                onEdited={() => pageContext.goBack()}
                settingKey={props.settingKey} />
        </>
    )
}