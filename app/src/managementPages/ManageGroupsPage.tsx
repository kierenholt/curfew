import { Button } from "@mui/material";
import { useContext } from "react";
import { CurrentPage, PageContext } from "./PageContent";
import { UserGroupList } from "../GroupList";

export interface ManageGroupsProps {

}

export function ManageGroupsPage() {
    const pageContext = useContext(PageContext);
    
    return (
        <>
            <p>
                list of groups
            </p>
            <UserGroupList />
            <Button onClick={() => pageContext.goTo(CurrentPage.createGroup)} >
                create a new group
            </Button>
        </>
    )
}