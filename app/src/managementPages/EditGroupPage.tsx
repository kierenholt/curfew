import { useContext } from "react";
import { CurrentPage, PageContext } from "./ManagementIndex";
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
            <GroupEditForm onCreated={() => pageContext.setCurrentPage(CurrentPage.manageGroups)} 
                groupId={props.params.groupId} />
        </>
    )
}