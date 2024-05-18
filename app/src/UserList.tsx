import { useContext, useEffect, useState } from "react"
import { List, ListItem, ListItemButton, ListItemDecorator, ListItemContent, IconButton } from "@mui/joy";
import { IUser } from "./types";
import { Helpers } from "./helpers";
import { Edit } from "@mui/icons-material";
import { CurrentPage, PageContext } from "./App";
import PersonIcon from '@mui/icons-material/Person';


export function UserList() {
    const pageContext = useContext(PageContext);
    let [users, setUsers] = useState<IUser[]>([]);

    useEffect(() => {
        Helpers.get<IUser[]>("/api/users/")
            .then((users: IUser[]) => {
                setUsers(users)
            })
    }, []);

    return (<List>
        {users.map((g: IUser) =>
            <ListItem color="neutral"

                endAction={
                    <IconButton aria-label="Edit" size="sm" variant="plain" color="neutral"
                        onClick={() => pageContext.setCurrentPage(CurrentPage.editUser)}>
                        <Edit />
                    </IconButton>
                }>
                <ListItemButton>
                    <ListItemDecorator>
                        <PersonIcon />
                    </ListItemDecorator>
                    <ListItemContent>
                        {g.name}
                    </ListItemContent>
                </ListItemButton>
            </ListItem>)}
    </List>
    )
}