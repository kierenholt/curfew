import { useContext } from "react";
import { CurrentPage, PageContext } from "./PageContent";
import { QuotaEditForm } from "../QuotaEditForm";

export interface EditQuotaPageProps {
    params: any //groupId day
}

export function EditQuotaPage(props: EditQuotaPageProps) {
    const pageContext = useContext(PageContext);
    
    return (
        <>
            <p>
                Edit quota
            </p>
            <QuotaEditForm onEdited={() => pageContext.setCurrentPage(CurrentPage.manageQuotas)} 
                groupId={props.params.groupId} day={props.params.day} />
        </>
    )
}