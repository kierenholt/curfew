import React, { createContext, useState } from 'react';
import './App.css';

import { CreateDevicePage } from './pages/CreateDevicePage';
import { ManageUsersPage } from './pages/ManageUsersPage';
import { EditUserPage } from './pages/EditUserPage';
import { ManageGroupsPage } from './pages/ManageGroupsPage';
import { EditGroupPage } from './pages/EditGroupPage';
import { CreateUserPage } from './pages/CreateUserPage';
import { CreateGroupPage } from './pages/CreateGroupPage';

export enum CurrentPage {
    nameThisDevice, 
    manageUsers, editUser, createUser,  
    manageGroups, editGroup, createGroup,
}

export const PageContext = createContext<any>({ setCurrentPage: () => {} });

function App() {
    const [currentPage, setCurrentPage] = useState<CurrentPage>(CurrentPage.nameThisDevice);

    return (

        <PageContext.Provider value={{ setCurrentPage: setCurrentPage }}>

            { 
                currentPage === CurrentPage.nameThisDevice ?
                <CreateDevicePage />
                : currentPage === CurrentPage.manageUsers ?
                <ManageUsersPage />
                : currentPage === CurrentPage.editUser ?
                <EditUserPage />
                : currentPage === CurrentPage.createUser ?
                <CreateUserPage />
                : currentPage === CurrentPage.manageGroups ?
                <ManageGroupsPage />
                : currentPage === CurrentPage.editGroup ?
                <EditGroupPage />
                : currentPage === CurrentPage.createGroup ?
                <CreateGroupPage />
                :
                <p>
                    page not found
                </p>
            }
        </PageContext.Provider>
    );
}

export default App;
