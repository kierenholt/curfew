import { Button } from "@mui/material";
import { useContext } from "react";
import { CurrentPage, PageContext } from "../App";
import { GroupCreateForm } from "../GroupCreateForm";


export function CreateGroupPage() {
    const pageContext = useContext(PageContext);
    
    return (
        <>
            <p>
                New User Group
            </p>
            <GroupCreateForm onCreated={() => null} />
            <Button onClick={() => pageContext.setCurrentPage(CurrentPage.manageGroups)} >
                back to manage Groups
            </Button>
        </>
    )
}