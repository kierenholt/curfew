import { useContext } from "react";
import { CurrentPage, PageContext } from "./PageContent";
import { SettingEditFormAsNumber } from "../SettingEditFormAsNumber";
import { SettingEditFormAsBoolean } from "../SettingEditFormAsBoolean";

export interface EditSettingPageProps {
    params: any //key
}

export function EditSettingPage(props: EditSettingPageProps) {
    const pageContext = useContext(PageContext);
    const settingIsStoredAsNumber: any = {
        1: true,
        2: false,
        3: true,
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
                    onEdited={() => pageContext.setCurrentPage(CurrentPage.manageSettings)} 
                    settingKey={props.params.key}/>
                :
                <SettingEditFormAsBoolean
                    onEdited={() => pageContext.setCurrentPage(CurrentPage.manageSettings)} 
                    settingKey={props.params.key}/>
            }
        </>
    )
}