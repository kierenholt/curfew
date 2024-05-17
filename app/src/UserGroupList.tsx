import { useEffect, useState } from "react"
import { List, ListItem, ListItemButton, ListItemDecorator, ListItemContent, IconButton } from "@mui/joy";
import GroupIcon from '@mui/icons-material/Group';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { IUserGroup } from "./types";
import { Helpers } from "./helpers";
import { Edit } from "@mui/icons-material";
import { UserGroupEditModal } from "./UserGroupEditModal";

interface UserGroupListProps {
    setSelectedUserGroup: (u: IUserGroup | null) => void;
    selectedGroup: IUserGroup | null;
}

export function UserGroupList(props: UserGroupListProps) {
    let [groups, setGroups] = useState<IUserGroup[]>([]);
    let [modalUserId, setModalUserId] = useState<number>(0);
    
    useEffect(() => {
        Helpers.get<IUserGroup[]>("/api/userGroups/")
            .then((groups: IUserGroup[]) => {
                setGroups(groups)
        })
    }, []);

    const createNewGroup = () => {
        let newGroup = {
            name: "new group",
            isUnrestricted: true,
            id: 0
        };
        Helpers.post<number>("/api/userGroups/", newGroup)
            .then((id: number) => {
                setGroups([...groups, {id: id, name: newGroup.name, isUnrestricted: newGroup.isUnrestricted}]);
            })
    }

    const isSelectedGroup = (u: IUserGroup): boolean => {
        return u === props.selectedGroup;
    }

    const handleModalClose = () => {
        
    }

    return (<List>
        {groups.map((g: IUserGroup) =>
            <ListItem color="neutral"
            
        endAction={
            <IconButton aria-label="Edit" size="sm" variant="plain" color="neutral"
                onClick={() => {setModalUserId(g.id)}}>
              <Edit />
            </IconButton>
          }>
                <ListItemButton onClick={() => props.setSelectedUserGroup(g)}
                    selected={isSelectedGroup(g)}>
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

            <UserGroupEditModal userGroupId={modalUserId} 
                onClose={handleModalClose}/>
    </List>
    )
}