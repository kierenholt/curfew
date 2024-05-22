import React, { createContext, useState } from 'react';

import { CreateDevicePage } from './CreateDevicePage';
import { EditUserPage } from './EditUserPage';
import { ManageGroupsPage } from './ManageGroupsPage';
import { EditGroupPage } from './EditGroupPage';
import { CreateUserPage } from './CreateUserPage';
import { CreateGroupPage } from './CreateGroupPage';
import { EditDevicePage } from './EditDevicePage';
import { ManageDevicesPage } from './ManageDevicesPage';
import { ManageUsersPage } from './ManageUsersPage';

import { Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import DevicesIcon from '@mui/icons-material/Devices';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import BlockIcon from '@mui/icons-material/Block';

import { ManageQuotasPage } from './ManageQuotasPage';
import { EditQuotaPage } from './EditQuotaPage';
import { ManageBookingsPage } from './ManageBookingsPage';
import { UserMakesBookingPage } from './UserMakesBookingPage';
import { ManageBansPage } from './ManageBansPage';

export enum CurrentPage {
    manageDevices, editDevice, createDevice,
    manageUsers, editUser, createUser,
    manageGroups, editGroup, createGroup,
    manageQuotas, editQuota,
    manageBookings, userMakesBooking,
    manageBans
}

interface SetPageAction {
    setCurrentPage: (p: CurrentPage) => void,
    setParams: (p: any) => void
}

export const PageContext = createContext<SetPageAction>(
    { setCurrentPage: () => { }, setParams: () => { } }
);

const iconButtonStyle = {
    padding: "2px 20px",
    cursor: "pointer",
}

export const PageContextWrapper = () => {
    //default page
    const [currentPage, setCurrentPage] = useState<CurrentPage>(CurrentPage.userMakesBooking);
    const [params, setParams] = useState<any>({});
    const [showUsers, setShowUsers] = useState<boolean>(false);

    return (
        <PageContext.Provider value={{
            setCurrentPage: setCurrentPage,
            setParams: setParams
        }}>
            {
                currentPage === CurrentPage.manageDevices ?
                    <ManageDevicesPage />
                    : currentPage === CurrentPage.editDevice ?
                        <EditDevicePage params={params} />
                        : currentPage === CurrentPage.createDevice ?
                            <CreateDevicePage />
                            : currentPage === CurrentPage.manageUsers ?
                                <ManageUsersPage />
                                : currentPage === CurrentPage.editUser ?
                                    <EditUserPage params={params} />
                                    : currentPage === CurrentPage.createUser ?
                                        <CreateUserPage />
                                        : currentPage === CurrentPage.manageGroups ?
                                            <ManageGroupsPage />
                                            : currentPage === CurrentPage.editGroup ?
                                                <EditGroupPage params={params} />
                                                : currentPage === CurrentPage.createGroup ?
                                                    <CreateGroupPage />
                                                    : currentPage === CurrentPage.manageQuotas ?
                                                        <ManageQuotasPage params={params} />
                                                        : currentPage === CurrentPage.editQuota ?
                                                            <EditQuotaPage params={params} />
                                                            : currentPage === CurrentPage.manageBookings ?
                                                                <ManageBookingsPage params={params} />
                                                                : currentPage === CurrentPage.userMakesBooking ?
                                                                    <UserMakesBookingPage />
                                                                    : currentPage === CurrentPage.manageBans ?
                                                                        <ManageBansPage />
                                                        :
                                                        <p>
                                                            page not found
                                                        </p>
            }

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
                        onClick={() => { setCurrentPage(CurrentPage.manageDevices) }}
                        sx={iconButtonStyle}>
                        <DevicesIcon fontSize="large" />
                        <p>Devices</p>
                    </Stack>
                    <Stack direction="column" alignItems="center"
                        onClick={() => { setCurrentPage(CurrentPage.manageUsers) }}
                        sx={iconButtonStyle}>
                        <PersonIcon fontSize="large" />
                        <p>Users</p>
                    </Stack>
                    <Stack direction="column" alignItems="center"
                        onClick={() => { setCurrentPage(CurrentPage.manageGroups) }}
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
                            setParams({groupId: 0});
                            setCurrentPage(CurrentPage.manageQuotas);
                        }}
                        sx={iconButtonStyle}>
                        <TimelapseIcon fontSize="large" />
                        <p>Quotas</p>
                    </Stack>
                    <Stack direction="column" alignItems="center"
                        onClick={() => { 
                            setParams({userId: 0});
                            setCurrentPage(CurrentPage.manageBookings);
                        }}
                        sx={iconButtonStyle}>
                        <HourglassTopIcon fontSize="large" />
                        <p>Bookings</p>
                    </Stack>
                    <Stack direction="column" alignItems="center"
                        onClick={() => { 
                            setParams({});
                            setCurrentPage(CurrentPage.manageBans);
                        }}
                        sx={iconButtonStyle}>
                        <BlockIcon fontSize="large" />
                        <p>Bans</p>
                    </Stack>
                </Stack>
            }
        </PageContext.Provider>
    );
} 