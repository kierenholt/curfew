import { useEffect, useState } from "react"
import { UserGroup } from "../../db/userGroup"
import { List, ListItem, ListItemButton, ListItemDecorator, ListItemContent } from "@mui/joy";
import GroupIcon from '@mui/icons-material/Group';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { Helpers } from "../../helpers";

interface UserGroupListProps {
    setSelectedUserGroup: (u: UserGroup) => void;
}

export function UserGroupList(props: UserGroupListProps) {
    let [groups, setGroups] = useState<UserGroup[]>([]);

    useEffect(() => {
        Helpers.get<UserGroup[]>("/api/userGroups/")
            .then((groups: UserGroup[]) => {
                setGroups(groups)
        })
    }, []);

    const createNewGroup = () => {
        let newGroup = {
            name: "new group",
            isRestricted: true,
            id: 0
        };
        Helpers.post<number>("/api/userGroups/", newGroup)
            .then((id: number) => {
                setGroups([...groups, new UserGroup(id, newGroup.name, newGroup.isRestricted ? 1 : 0)]);
            })
    }

    return (<List>
        {groups.map((g: UserGroup) =>
            <ListItem>
                <ListItemButton onClick={() => props.setSelectedUserGroup(g)}>
                    <ListItemDecorator>
                        <GroupIcon />
                    </ListItemDecorator>
                    <ListItemContent>
                        {g.name}
                    </ListItemContent>
                </ListItemButton>
            </ListItem>)}

            <ListItemButton onClick={createNewGroup}>
                <ListItemDecorator>
                    <GroupAddIcon />
                </ListItemDecorator>
                <ListItemContent>
                    Create a group
                </ListItemContent>
            </ListItemButton>
    </List>
    )
}