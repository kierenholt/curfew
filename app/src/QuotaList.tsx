import { useContext, useEffect, useState } from "react"
import { List, ListItem, ListItemButton, ListItemDecorator, ListItemContent, IconButton } from "@mui/joy";
import { IQuota } from "./types";
import { Helpers } from "./helpers";
import { Edit } from "@mui/icons-material";
import { CurrentPage, PageContext } from "./managementPages/PageContent";
import TimelapseIcon from '@mui/icons-material/Timelapse';
import { Day } from "./Day";

export interface QuotaListProps {
    quotas: IQuota[];
} 

export function QuotaList(props: QuotaListProps) {
    const pageContext = useContext(PageContext);

    return (<List>
        {props.quotas.map((g: IQuota) =>
            <ListItem color="neutral"

                endAction={
                    <>
                    <IconButton aria-label="Edit" size="sm" variant="plain" color="neutral"
                        onClick={() => {
                            pageContext.setParams({groupId: g.groupId, day: g.day})
                            pageContext.setCurrentPage(CurrentPage.editQuota)
                        }}>
                        <Edit />
                    </IconButton>
                    </>
                }>
                <ListItemButton>
                    <ListItemDecorator>
                        <TimelapseIcon />
                    </ListItemDecorator>
                    <ListItemContent>
                        <Day day={g.day} full={true} />, {g.refreshAmount} mins 
                    </ListItemContent>
                </ListItemButton>
            </ListItem>)}
    </List>
    )
}