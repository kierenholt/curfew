import { useContext, useEffect, useState } from "react"
import { List, ListItem, ListItemButton, ListItemDecorator, ListItemContent, IconButton } from "@mui/joy";
import { IUser } from "./types";
import { Helpers } from "./helpers";
import { Delete, Edit } from "@mui/icons-material";
import { CurrentPage, PageContext } from "./managementPages/PageContent";
import { AdministratorIcon, BookingIcon, UserIcon } from "./Icon";
import { Tooltip } from "@mui/material";


export function UserList() {
    const pageContext = useContext(PageContext);
    let [users, setUsers] = useState<IUser[]>([]);

    useEffect(() => {
        Helpers.get<IUser[]>("/api/users/")
            .then((users: IUser[]) => {
                setUsers(users)
            })
    }, []);


    const deleteUser = (id: number) => {
        Helpers.delete(`/api/users/${id}`)
            .then((deleted: number) => {
                console.log("deleted: " + deleted);
                if (deleted > 0) {
                    setUsers(users.filter(g => g.id !== id));
                }
            })
    }

    return (<List>
        {users.map((g: IUser) =>
            <ListItem color="neutral"

                endAction={
                    <>
                        <IconButton aria-label="Bookings" size="sm" variant="plain" color="neutral"
                            onClick={() => {
                                pageContext.setParams({ userId: g.id });
                                pageContext.setCurrentPage(CurrentPage.manageBookings);
                            }}>
                            <BookingIcon />
                        </IconButton>
                        <IconButton aria-label="Edit" size="sm" variant="plain" color="neutral"
                            onClick={() => {
                                pageContext.setParams({ userId: g.id })
                                pageContext.setCurrentPage(CurrentPage.editUser)
                            }}>
                            <Edit />
                        </IconButton>
                        <Tooltip title={g.hasDevices ? "if you wish to delete this user, delete their devices first." : "click to delete this user"}>
                            <span>
                                <IconButton aria-label="Delete" size="sm" variant="plain" color="neutral"
                                    onClick={() => deleteUser(g.id)}
                                    disabled={g.hasDevices}>
                                    <Delete />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </>
                }>
                <ListItemButton>
                    <ListItemDecorator>
                        {
                            g.isAdministrator
                                ?
                                <Tooltip title={"this user is an administrator"}>
                                    <AdministratorIcon />
                                </Tooltip>
                                :
                                <UserIcon />
                        }
                    </ListItemDecorator>
                    <ListItemContent>
                        {g.name}
                    </ListItemContent>
                </ListItemButton>
            </ListItem>)}
    </List>
    )
}