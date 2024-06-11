import { Edit, Delete } from "@mui/icons-material";
import { Accordion, Box, AccordionSummary, Typography, AccordionDetails } from "@mui/material";
import { useContext, useState } from "react";
import { DeviceList } from "./DeviceList";
import { BookingIcon, UndeleteIcon } from "./Icon";
import { UserBanToggleButton } from "./UserBanToggleButton";
import { UserIcon } from "./UserIcon";
import { Helpers } from "./helpers";
import { PageContext, CurrentPage } from "./managementPages/PageContent";
import { IUser } from "./types";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IconButton } from "@mui/joy";


export interface UserListItemProps {
    user: IUser;
}

export const UserListItem = (props: UserListItemProps) => {
    const pageContext = useContext(PageContext);
    const [isDeleted, setIsDeleted] = useState<boolean>(props.user.isDeleted);

    const setDeleted = (u: IUser, value: boolean) => {
        Helpers.put<number>(`/api/users/${u.id}/isDeleted=${value ? 1 : 0}`, {})
            .then((updated: number) => {
                if (updated > 0) {
                    setIsDeleted(value);
                }
            })
    }

    return (
        <Accordion color="neutral">

                <Box sx={{ display: "flex" }}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel2a-header"
                        sx={{ flexGrow: 1 }}
                    >
                        <Typography>
                            <UserIcon user={props.user} />
                                {props.user.name} {isDeleted ? "(deleted)" : ""}
                        </Typography>
                    </AccordionSummary>
                    <Box>
                        <UserBanToggleButton user={props.user} />
                        <IconButton aria-label="Bookings" size="sm" variant="plain" color="neutral"
                            onClick={() => {
                                pageContext.setParams({ userId: props.user.id });
                                pageContext.goTo(CurrentPage.manageBookings);
                            }}>
                            <BookingIcon />
                        </IconButton>
                        <IconButton aria-label="Edit" size="sm" variant="plain" color="neutral"
                            onClick={() => {
                                pageContext.setParams({ userId: props.user.id, showAdminBox: true })
                                pageContext.goTo(CurrentPage.editUser)
                            }}>
                            <Edit />
                        </IconButton>
                        {
                            isDeleted
                                ?
                                <IconButton aria-label="Undelete" size="sm" variant="plain" color="neutral"
                                    onClick={() => setDeleted(props.user, false)}>
                                    <UndeleteIcon />
                                </IconButton>
                                :
                                <IconButton aria-label="Delete" size="sm" variant="plain" color="neutral"
                                    onClick={() => setDeleted(props.user, true)}>
                                    <Delete />
                                </IconButton>
                        }
                    </Box>
                </Box>
                <AccordionDetails>
                    {props.user.devices && <DeviceList initialDevices={props.user.devices} />}
                </AccordionDetails>
            </Accordion>
    )
}