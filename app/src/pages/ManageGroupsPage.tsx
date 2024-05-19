import { Button } from "@mui/material";
import { useContext } from "react";
import { CurrentPage, PageContext } from "../PageContext";
import { UserGroupList } from "../GroupList";

export interface ManageGroupsProps {

}

export function ManageGroupsPage() {
    const pageContext = useContext(PageContext);
    
    return (
        <>
            <p>
                manage groups
            </p>
            <UserGroupList />
            <Button onClick={() => pageContext.setCurrentPage(CurrentPage.createGroup)} >
                add a new group
            </Button>
            <Button onClick={() => pageContext.setCurrentPage(CurrentPage.manageUsers)} >
                manage users
            </Button>
        </>
    )
}