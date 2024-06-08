import { useContext, useState } from "react"
import { IconButton } from "@mui/joy";
import { IUser } from "./types";
import { Helpers } from "./helpers";
import { Delete, Edit } from "@mui/icons-material";
import { CurrentPage, PageContext } from "./managementPages/PageContent";
import { BookingIcon } from "./Icon";
import { Accordion, AccordionActions, AccordionDetails, AccordionSummary, Box, Stack, Tooltip, Typography } from "@mui/material";
import { DeviceList } from "./DeviceList";
import { UserIcon } from "./UserIcon";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { UserBanToggleButton } from "./UserBanToggleButton";

export interface UserListProps {
    initialUsers: IUser[];
}

export function UserList(props: UserListProps) {
    const pageContext = useContext(PageContext);
    const [users, setUsers] = useState<IUser[]>(props.initialUsers);

    const deleteUser = (id: number) => {
        Helpers.delete(`/api/users/${id}`)
            .then((deleted: number) => {
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

                <Box sx={{ display: "flex" }}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel2a-header"
                        sx={{ flexGrow: 1 }}
                    >
                        <Typography>
                            <UserIcon user={g} />
                                {g.name}
                        </Typography>
                    </AccordionSummary>
                    <Box>
                        <UserBanToggleButton user={g} />
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
                    </Box>
                </Box>
                <AccordionDetails>
                    {g.devices && <DeviceList initialDevices={g.devices} />}
                </AccordionDetails>
            </Accordion>)}
    </Stack>
    )
}