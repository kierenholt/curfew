import { Button } from "@mui/material";
import { useContext } from "react";
import { CurrentPage, PageContext } from "./PageContent";
import { UserList } from "../UserList";

export interface ManageOwnersProps {

}

export function ManageUsersPage() {
    const pageContext = useContext(PageContext);
    
    return (
        <>
            <p>list of users</p>
            <UserList />
            <Button onClick={() => pageContext.setCurrentPage(CurrentPage.createUser)} >create a new user</Button>
        </>
    )
}