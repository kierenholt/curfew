import { useContext, useEffect, useState } from "react"
import { List, ListItem, ListItemButton, ListItemDecorator, ListItemContent, IconButton } from "@mui/joy";
import { IQuota } from "./types";
import { Helpers } from "./helpers";
import { Edit } from "@mui/icons-material";
import { CurrentPage, PageContext } from "./pages/PageContext";
import PersonIcon from '@mui/icons-material/Person';
import { Day } from "./Day";

export interface QuotaListProps {
    groupId: number;
} 

export function QuotaList(props: QuotaListProps) {
    const pageContext = useContext(PageContext);
    let [quotas, setQuotas] = useState<IQuota[]>([]);

    useEffect(() => {
        if (props.groupId > 0) {
            Helpers.get<IQuota[]>(`/api/quotas/${props.groupId}`)
                .then((quotas: IQuota[]) => {
                    setQuotas(quotas)
                })
        }
    }, [props.groupId]);

    

    return (<List>
        {quotas.map((g: IQuota) =>
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
                        <PersonIcon />
                    </ListItemDecorator>
                    <ListItemContent>
                        <Day day={g.day} full={true} />, {g.refreshAmount} mins 
                    </ListItemContent>
                </ListItemButton>
            </ListItem>)}
    </List>
    )
}