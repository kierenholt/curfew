import { ToggleButtonGroup, ToggleButton, Stack } from "@mui/material";
import { CurrentPage } from "./PageContext";
import { useState } from "react";

import DevicesIcon from '@mui/icons-material/Devices';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import BlockIcon from '@mui/icons-material/Block';

export interface BottomMenuProps {
    setCurrentPage: (p: CurrentPage) => void,
    setParams: (p: any) => void
}

export const BottomMenu = (props: BottomMenuProps) => {
    const [showUsers, setShowUsers] = useState<boolean>(false);

    const iconButtonStyle = {
        padding: "2px 20px",
        cursor: "pointer",
    }

    return (
        <>
        <ToggleButtonGroup sx={{display: "block", width: "100%"}}
            color="primary"
            value={showUsers}
            exclusive
            onChange={(e: any, value: any) => {
                if (value !== null) {
                    setShowUsers(value);
                }
            }}
            aria-label="show users"
        >
            <ToggleButton sx={{width: "50%"}} value={true}>Users</ToggleButton>
            <ToggleButton sx={{width: "50%"}} value={false}>Quotas</ToggleButton>
        </ToggleButtonGroup>

        {showUsers ?
            <Stack
                direction="row" justifyContent="space-around" alignItems="stretch"
                height="100px">
                <Stack direction="column" alignItems="center"
                    onClick={() => { props.setCurrentPage(CurrentPage.manageDevices) }}
                    sx={iconButtonStyle}>
                    <DevicesIcon fontSize="large" />
                    <p>Devices</p>
                </Stack>
                <Stack direction="column" alignItems="center"
                    onClick={() => { props.setCurrentPage(CurrentPage.manageUsers) }}
                    sx={iconButtonStyle}>
                    <PersonIcon fontSize="large" />
                    <p>Users</p>
                </Stack>
                <Stack direction="column" alignItems="center"
                    onClick={() => { props.setCurrentPage(CurrentPage.manageGroups) }}
                    sx={iconButtonStyle}>
                    <GroupIcon fontSize="large" />
                    <p>Groups</p>
                </Stack>
            </Stack>
            :
            <Stack direction="row" justifyContent="space-around" alignItems="stretch"
                height="100px">
                <Stack direction="column" alignItems="center"
                    onClick={() => { 
                        props.setParams({groupId: 0});
                        props.setCurrentPage(CurrentPage.manageQuotas);
                    }}
                    sx={iconButtonStyle}>
                    <TimelapseIcon fontSize="large" />
                    <p>Quotas</p>
                </Stack>
                <Stack direction="column" alignItems="center"
                    onClick={() => { 
                        props.setParams({userId: 0});
                        props.setCurrentPage(CurrentPage.manageBookings);
                    }}
                    sx={iconButtonStyle}>
                    <HourglassTopIcon fontSize="large" />
                    <p>Bookings</p>
                </Stack>
                <Stack direction="column" alignItems="center"
                    onClick={() => { 
                        props.setParams({});
                        props.setCurrentPage(CurrentPage.manageBans);
                    }}
                    sx={iconButtonStyle}>
                    <BlockIcon fontSize="large" />
                    <p>Bans</p>
                </Stack>
            </Stack>
        }
        </>
    )
}