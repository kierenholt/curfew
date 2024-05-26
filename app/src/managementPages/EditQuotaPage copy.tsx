import { useContext } from "react";
import { CurrentPage, PageContext } from "./PageContent";
import { UserEditForm } from "../UserEditForm";

export interface EditQuotaPageProps {
    params: any //groupId day
}

export const EditQuotaPage = (props: EditQuotaPageProps) => {
    const pageContext = useContext(PageContext);
    
    return (
        <>
            <p>
                Edit quota
            </p>
            <UserEditForm onEdited={() => pageContext.setCurrentPage(CurrentPage.manageUsers)} 
                userId={props.params.userId} />
        </>
    )
}