import { useContext, useEffect, useState } from "react";
import { GroupSelect } from "../GroupSelect";
import { Helpers } from "../helpers";
import { IFilter } from "../types";
import { FilterList } from "../FilterList";
import { Button } from "@mui/material";
import { CurrentPage, PageContext } from "./PageContent";

export interface ManageFiltersProps {
    params: any //groupId
}

export function ManageFiltersPage(props: ManageFiltersProps) {
    const pageContext = useContext(PageContext);
    const [groupId, setGroupId] = useState<number>(props?.params?.groupId ?? 1);

    let [filters, setFilters] = useState<IFilter[]>([]);

    useEffect(() => {
        if (groupId > 0) {
            Helpers.get<IFilter[]>(`/api/filters/userGroup/${groupId}`)
                .then((filters: IFilter[]) => {
                    setFilters(filters)
                })
        }
    }, [groupId]);
    
    return (
        <>
            <p>
                Filters for group: 
                <GroupSelect setSelectedGroupId={setGroupId} selectedGroupId={groupId} />
            </p>
            { groupId === 0 ? 
                <p>please select a group first</p>
            :
                <FilterList filters={filters} 
                    allowEdit={true} setFilters={(f: IFilter[]) => setFilters(f)}/>
                }
                <Button onClick={() => pageContext.setCurrentPage(CurrentPage.createFilter)} >
                    create a new filter
                </Button>
        </>
    )
}