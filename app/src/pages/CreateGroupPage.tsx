import { Button } from "@mui/material";
import { useContext } from "react";
import { CurrentPage, PageContext } from "../PageContext";
import { GroupCreateForm } from "../GroupCreateForm";


export function CreateGroupPage() {
    const pageContext = useContext(PageContext);
    
    return (
        <>
            <p>
                New User Group
            </p>
            <GroupCreateForm onCreated={() => pageContext.setCurrentPage(CurrentPage.manageGroups)} />
        </>
    )
}