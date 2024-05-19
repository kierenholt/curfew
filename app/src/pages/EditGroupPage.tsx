import { Button } from "@mui/material";
import { useContext } from "react";
import { CurrentPage, PageContext } from "../PageContext";
import { GroupEditForm } from "../GroupEditForm";

export interface EditGroupProps {
    params: any; //groupId
}

export function EditGroupPage(props: EditGroupProps) {
    const pageContext = useContext(PageContext);
    
    return (
        <>
            <p>
                edit group details
            </p>
            <GroupEditForm onCreated={() => {}} 
                groupId={props.params.groupId} />
            <Button onClick={() => pageContext.setCurrentPage(CurrentPage.manageUsers)} >manage users</Button>
        </>
    )
}