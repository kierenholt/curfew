import { useContext } from "react";
import { PageContext } from "./PageContent";
import { SettingEditFormAsNumber } from "../SettingEditFormAsNumber";
import { SettingEditFormAsBoolean } from "../SettingEditFormAsBoolean";

export interface EditSettingPageProps {
    params: any //key
}

export function EditSettingPage(props: EditSettingPageProps) {
    const pageContext = useContext(PageContext);
    const settingIsStoredAsNumber: any = {
        1: true, //apiGetRequestLimit
        2: false, //groupRequests
        3: true, //requestExpiryDays
        4: false, //showNonAdminsNameChangeLink
        5: false, //viewDeleted
        6: false, //groupByFilterType
    };

    return (
        <>
            <p>
                Edit Setting
            </p>
            {
                settingIsStoredAsNumber[props.params.key]
                ?
                <SettingEditFormAsNumber 
                    onEdited={() => pageContext.goBack()} 
                    settingKey={props.params.key}/>
                :
                <SettingEditFormAsBoolean
                    onEdited={() => pageContext.goBack()} 
                    settingKey={props.params.key}/>
            }
        </>
    )
}