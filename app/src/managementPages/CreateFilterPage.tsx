import { useContext } from "react";
import { CurrentPage, PageContext } from "./PageContent";
import { FilterCreateForm } from "../FilterCreateForm";

export interface CreateFilterPageProps {
    params: any; //component, groupId
}

export function CreateFilterPage(props: CreateFilterPageProps) {
    const pageContext = useContext(PageContext);
    
    return (
        <>
            <p>
                New Filter
            </p>
            <FilterCreateForm 
                component={props?.params?.component} 
                groupId={props?.params?.groupId}
                onCreated={() => pageContext.setCurrentPage(CurrentPage.manageFilters)} />
        </>
    )
}