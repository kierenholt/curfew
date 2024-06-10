import { useContext, } from "react"
import { List, ListItem, ListItemButton, ListItemDecorator, ListItemContent, IconButton } from "@mui/joy";
import { IQuota } from "./types";
import { Edit } from "@mui/icons-material";
import { CurrentPage, PageContext } from "./managementPages/PageContent";
import { Day } from "./Day";
import { QuotaIcon } from "./Icon";

export interface QuotaListProps {
    quotas: IQuota[];
    allowEdit: boolean;
} 

export function QuotaList(props: QuotaListProps) {
    const pageContext = useContext(PageContext);

    return (<List>
        {props.quotas.map((g: IQuota) =>
            <ListItem color="neutral" key={`${g.groupId}-${g.day}`}

                endAction={props.allowEdit
                    ? 
                    <>
                    <IconButton aria-label="Edit" size="sm" variant="plain" color="neutral"
                        onClick={() => {
                            pageContext.setParams({groupId: g.groupId, day: g.day})
                            pageContext.goTo(CurrentPage.editQuota)
                        }}>
                        <Edit />
                    </IconButton>
                    </>
                    : 
                    <></>
                }>
                <ListItemButton>
                    <ListItemDecorator>
                        <QuotaIcon />
                    </ListItemDecorator>
                    <ListItemContent>
                        <Day day={g.day} full={true} />, {g.refreshAmount} mins 
                    </ListItemContent>
                </ListItemButton>
            </ListItem>)}
    </List>
    )
}