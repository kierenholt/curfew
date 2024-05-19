import { useContext, useEffect, useState } from "react"
import { List, ListItem, ListItemButton, ListItemDecorator, ListItemContent, IconButton } from "@mui/joy";
import GroupIcon from '@mui/icons-material/Group';
import { IUserGroup } from "./types";
import { Helpers } from "./helpers";
import { Edit } from "@mui/icons-material";
import { CurrentPage, PageContext } from "./PageContext";

export function UserGroupList() {
    const pageContext = useContext(PageContext);
    let [groups, setGroups] = useState<IUserGroup[]>([]);

    useEffect(() => {
        Helpers.get<IUserGroup[]>("/api/userGroups/")
            .then((groups: IUserGroup[]) => {
                setGroups(groups)
            })
    }, []);

    return (<List>
        {groups.map((g: IUserGroup) =>
            <ListItem color="neutral"

                endAction={
                    <IconButton aria-label="Edit" size="sm" variant="plain" color="neutral"
                        onClick={() => {
                            pageContext.setParams({groupId: g.id});
                            pageContext.setCurrentPage(CurrentPage.editGroup);
                        }}>
                        <Edit />
                    </IconButton>
                }>
                <ListItemButton>
                    <ListItemDecorator>
                        <GroupIcon />
                    </ListItemDecorator>
                    <ListItemContent>
                        {g.name}
                    </ListItemContent>
                </ListItemButton>
            </ListItem>)}
    </List>
    )
}