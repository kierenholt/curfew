import { useContext } from "react";
import { CurrentPage, PageContext } from "./PageContent";
import { GroupCreateForm } from "../GroupCreateForm";


export function CreateGroupPage() {
    const pageContext = useContext(PageContext);
    
    return (
        <>
            <p>
                New User Group
            </p>
            <GroupCreateForm 
                onCreated={() => pageContext.goTo(CurrentPage.manageGroups)} />
        </>
    )
}