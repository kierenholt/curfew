import { List, ListItem, ListItemButton, ListItemDecorator, ListItemContent, IconButton } from "@mui/joy";
import { FilterAction, IFilter } from "./types";
import { Edit, Delete } from "@mui/icons-material";
import { CurrentPage, PageContext } from "./managementPages/PageContent";
import { Helpers } from "./helpers";
import { useContext } from "react";
import { FilterIcon } from "./Icon";

export interface FilterListProps {
    filters: IFilter[];
    allowEdit: boolean;
    setFilters: (f: IFilter[]) => void;
} 

export function FilterList(props: FilterListProps) {
    const pageContext = useContext(PageContext);


    const deleteFilter = (id: number) => {
        Helpers.delete(`/api/filters/${id}`)
            .then((deleted: number) => {
                console.log("deleted: " + deleted);
                if (deleted > 0) {
                    props.setFilters(props.filters.filter(g => g.id !== id));
                }
            })
    }

    const action = (f: IFilter) => {
        switch(f.action) {
            case FilterAction.alwaysAllow:
                return "always allow";
            case FilterAction.needsBooking:
                return "only when booked";
            case FilterAction.alwaysDeny:
                return "always deny";
            default:
                return ""
        }
    }

    return (<List>
        {props.filters.map((g: IFilter) =>
            <ListItem color="neutral"
            endAction={
                <>
                <IconButton aria-label="Edit" size="sm" variant="plain" color="neutral"
                    onClick={() => {
                        pageContext.setParams({id: g.id});
                        pageContext.setCurrentPage(CurrentPage.editFilter);
                    }}>
                    <Edit />
                </IconButton>
                <IconButton aria-label="Delete" size="sm" variant="plain" color="neutral"
                    onClick={() => deleteFilter(g.id)}>
                    <Delete />
                </IconButton>
                </>
            }>

                <ListItemButton>
                    <ListItemDecorator>
                        <FilterIcon />
                    </ListItemDecorator>
                    <ListItemContent>
                        {g.component}: {action(g)}
                    </ListItemContent>
                </ListItemButton>
            </ListItem>)}
    </List>
    )
}