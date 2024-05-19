import { Button } from "@mui/material";
import { useContext } from "react";
import { CurrentPage, PageContext } from "../PageContext";
import { UserEditForm } from "../UserEditForm";

export interface EditUserPageProps {
    params: any //userId
}

export function EditUserPage(props: EditUserPageProps) {
    const pageContext = useContext(PageContext);
    
    return (
        <>
            <p>
                Edit user details
            </p>
            <UserEditForm onEdited={() => pageContext.setCurrentPage(CurrentPage.manageUsers)} 
                userId={props.params.userId} />
            <Button onClick={() => pageContext.setCurrentPage(CurrentPage.manageUsers)} >manage owners</Button>
        </>
    )
}