import { useContext } from "react";
import { CurrentPage, PageContext } from "./PageContent";
import { SettingEditForm } from "../SettingEditForm";

export interface EditSettingPageProps {
    params: any //key
}

export function EditSettingPage(props: EditSettingPageProps) {
    const pageContext = useContext(PageContext);
    
    return (
        <>
            <p>
                Edit Setting
            </p>
            <SettingEditForm 
                onEdited={() => pageContext.setCurrentPage(CurrentPage.manageSettings)} 
                settingKey={props.params.key}/>
        </>
    )
}