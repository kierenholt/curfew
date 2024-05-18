import { Button } from "@mui/material";
import { useContext } from "react";
import { CurrentPage, PageContext } from "../App";
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
            <UserCreateForm onCreated={() => null} />
            <Button onClick={() => pageContext.setCurrentPage(CurrentPage.manageUsers)} >
                back to manage users
            </Button>
        </>
    )
}