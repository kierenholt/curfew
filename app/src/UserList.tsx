import { useContext, useState } from "react"
import { IconButton } from "@mui/joy";
import { IUser } from "./types";
import { Helpers } from "./helpers";
import { Delete, Edit } from "@mui/icons-material";
import { CurrentPage, PageContext } from "./managementPages/PageContent";
import { AdministratorIcon, BookingIcon, UserIcon } from "./Icon";
import { Accordion, AccordionActions, AccordionDetails, AccordionSummary, Stack, Tooltip } from "@mui/material";
import { DeviceList } from "./DeviceList";

export interface UserListProps {
    initialUsers: IUser[];
}

export function UserList(props: UserListProps) {
    const pageContext = useContext(PageContext);
    const [users, setUsers] = useState<IUser[]>(props.initialUsers);

    const deleteUser = (id: number) => {
        Helpers.delete(`/api/users/${id}`)
            .then((deleted: number) => {
                console.log("deleted: " + deleted);
                if (deleted > 0) {
                    setUsers(users.filter(g => g.id !== id));
                }
            })
    }

    const hasDevices = (u: IUser): boolean => {
        return u.devices !== undefined && u.devices.length > 0;
    }

    return (<Stack direction="column">
        {users.map((g: IUser) =>
            <Accordion color="neutral">
                <AccordionSummary>

                    {
                        g.isAdministrator
                            ?
                            <Tooltip title={"this user is an administrator"}>
                                <AdministratorIcon />
                            </Tooltip>
                            :
                            <UserIcon />
                    }
                    {g.name}
                </AccordionSummary>
                <AccordionDetails>
                    {g.devices && <DeviceList initialDevices={g.devices} />}
                </AccordionDetails>
                <AccordionActions>
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
                    <Tooltip title={hasDevices(g) ? "if you wish to delete this user, delete their devices first." : "click to delete this user"}>
                        <span>
                            <IconButton aria-label="Delete" size="sm" variant="plain" color="neutral"
                                onClick={() => deleteUser(g.id)}
                                disabled={hasDevices(g)}>
                                <Delete />
                            </IconButton>
                        </span>
                    </Tooltip>
                </AccordionActions>

            </Accordion>)}
    </Stack>
    )
}