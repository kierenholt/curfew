import { useContext } from "react";
import { CurrentPage, PageContext } from "./PageContent";
import { FilterEditForm } from "../FilterEditForm";

export interface EditFilterPageProps {
    params: any //id
}

export function EditFilterPage(props: EditFilterPageProps) {
    const pageContext = useContext(PageContext);
    
    return (
        <>
            <p>
                Edit Filter
            </p>
            <FilterEditForm 
                onEdited={() => pageContext.setCurrentPage(CurrentPage.manageFilters)} 
                id={props.params.id}/>
        </>
    )
}