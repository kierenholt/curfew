import { Button } from "@mui/material";
import { useContext } from "react";
import { CurrentPage, PageContext } from "./PageContent";
import { UserCreateForm } from "../UserCreateForm";

export interface NameThisUserProps {

}

export function CreateUserPage() {
    const pageContext = useContext(PageContext);
    
    return (
        <>
            <p>
                New User
            </p>
            <UserCreateForm onCreated={() => pageContext.setCurrentPage(CurrentPage.manageUsers)} />
        </>
    )
}