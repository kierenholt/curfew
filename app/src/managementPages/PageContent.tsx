import { createContext, useContext, useState } from 'react';

import { EditUserPage } from './EditUserPage';
import { ManageGroupsPage } from './ManageGroupsPage';
import { EditGroupPage } from './EditGroupPage';
import { CreateUserPage } from './CreateUserPage';
import { CreateGroupPage } from './CreateGroupPage';
import { EditDevicePage } from './EditDevicePage';

import { ManageQuotasPage } from './ManageQuotasPage';
import { EditQuotaPage } from './EditQuotaPage';
import { ManageBookingsPage } from './ManageBookingsPage';
import { ManageBansPage } from './ManageBansPage';
import { BottomMenu } from './BottomMenu';
import { MakeABookingPage } from './MakeABookingPage';
import { ManageRequestsPage } from './ManageRequestsPage';
import { ManageFiltersPage } from './ManageFiltersPage';
import { CreateFilterPage } from './CreateFilterPage';
import { EditFilterPage } from './EditFilterPage';
import { UserContext } from './DetectUser';
import { Header } from './Header';
import { ManageSettingsPage } from './ManageSettingsPage';
import { EditSettingPage } from './EditSettingPage';

export enum CurrentPage {
    editDevice,
    editUser, createUser,
    manageGroups, editGroup, createGroup,
    manageQuotas, editQuota,
    manageBookings,
    manageBans,
    userMakesBooking,
    manageRequests,
    manageFilters, editFilter, createFilter,
    manageSettings, editSetting
}

interface SetPageAction {
    setCurrentPage: (p: CurrentPage) => void,
    setParams: (p: any) => void
}

export const PageContext = createContext<SetPageAction>(
    { setCurrentPage: () => { }, setParams: () => { } }
);

export const PageContent = () => {
    //default page
    const userContext = useContext(UserContext);
    const [currentPage, setCurrentPage] = useState<CurrentPage>(CurrentPage.userMakesBooking);
    const [params, setParams] = useState<any>({});

    return (
        <PageContext.Provider value={{
            setCurrentPage: setCurrentPage,
            setParams: setParams
        }}>
            <Header />
            {
                currentPage === CurrentPage.editDevice ?
                    <EditDevicePage params={params} />
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
                                                        : currentPage === CurrentPage.manageBans ?
                                                            <ManageBansPage />
                                                            : currentPage === CurrentPage.manageFilters ?
                                                                <ManageFiltersPage params={params} />
                                                                : currentPage === CurrentPage.createFilter ?
                                                                    <CreateFilterPage params={params} />
                                                                    : currentPage === CurrentPage.editFilter ?
                                                                        <EditFilterPage params={params} />
                                                                        : currentPage === CurrentPage.manageSettings ?
                                                                            <ManageSettingsPage />
                                                                            : currentPage === CurrentPage.editSetting ?
                                                                                <EditSettingPage params={params} />
                                                                                : currentPage === CurrentPage.manageRequests ?
                                                                                    <ManageRequestsPage params={params} />
                                                                                    : currentPage === CurrentPage.userMakesBooking ?
                                                                                        <MakeABookingPage />
                                                                                        :
                                                                                        <MakeABookingPage /> //default
            }
            {
                userContext?.user?.isAdministrator
                    ?
                    <BottomMenu setCurrentPage={setCurrentPage} setParams={setParams} />
                    :
                    <></>
            }
        </PageContext.Provider>
    );
} 