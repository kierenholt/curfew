import { useContext } from "react";
import { CurrentPage, PageContext } from "./PageContent";
import { UserEditForm } from "../UserEditForm";

export interface EditUserPageProps {
    params: any //userId, //showAdminBox
}

export function EditUserPage(props: EditUserPageProps) {
    const pageContext = useContext(PageContext);
    
    return (
        <>
            <p>
                Edit user details
            </p>
            <UserEditForm onEdited={() => pageContext.goBack()} 
                userId={props.params.userId} 
                showAdminBox={props.params.showAdminBox === true}/>
        </>
    )
}