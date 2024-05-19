import React, { createContext, useState } from 'react';

import { CreateDevicePage } from './pages/CreateDevicePage';
import { EditUserPage } from './pages/EditUserPage';
import { ManageGroupsPage } from './pages/ManageGroupsPage';
import { EditGroupPage } from './pages/EditGroupPage';
import { CreateUserPage } from './pages/CreateUserPage';
import { CreateGroupPage } from './pages/CreateGroupPage';
import { EditDevicePage } from './pages/EditDevicePage';
import { ManageDevicesPage } from './pages/ManageDevicesPage';
import { ManageUsersPage } from './pages/ManageUsersPage';

import { Stack } from '@mui/material';
import DevicesIcon from '@mui/icons-material/Devices';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';

export enum CurrentPage {
    manageDevices, editDevice, createDevice, 
    manageUsers, editUser, createUser,  
    manageGroups, editGroup, createGroup,
}

interface SetPageAction {
    setCurrentPage: (p: CurrentPage) => void,
    setParams: (p: any) => void
}

export const PageContext = createContext<SetPageAction>(
    { setCurrentPage: () => {}, setParams: () => {} }
);

const iconButtonStyle = {
    padding: "2px 20px",
    cursor: "pointer",
}

export const PageContextWrapper = () => {
    const [currentPage, setCurrentPage] = useState<CurrentPage>(CurrentPage.createDevice);
    const [params, setParams] = useState<any>({});
    
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
                <EditUserPage params={params}/>
                : currentPage === CurrentPage.createUser ?
                <CreateUserPage />
                : currentPage === CurrentPage.manageGroups ?
                <ManageGroupsPage />
                : currentPage === CurrentPage.editGroup ?
                <EditGroupPage params={params}/>
                : currentPage === CurrentPage.createGroup ?
                <CreateGroupPage />
                :
                <p>
                    page not found
                </p>
            }
            <Stack direction="row" justifyContent="space-around" alignItems="stretch"
                height="100px">
                <Stack direction="column" alignItems="center"
                    onClick={() => {setCurrentPage(CurrentPage.manageDevices)}}
                    sx={iconButtonStyle}>
                    <DevicesIcon fontSize="large"/>
                    <p>Devices</p>
                </Stack>
                <Stack direction="column" alignItems="center"
                    onClick={() => {setCurrentPage(CurrentPage.manageUsers)}}
                    sx={iconButtonStyle}>
                    <PersonIcon fontSize="large"/>
                    <p>Users</p>
                </Stack>
                <Stack direction="column" alignItems="center"
                    onClick={() => {setCurrentPage(CurrentPage.manageGroups)}}
                    sx={iconButtonStyle}>
                    <GroupIcon fontSize="large"/>
                    <p>Groups</p>
                </Stack>
            </Stack>
        </PageContext.Provider>
    );
} 