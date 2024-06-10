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
import { BookingConfirmed } from './BookingConfirmed';

export enum CurrentPage {
    editDevice,
    editUser, createUser,
    manageGroups, editGroup, createGroup,
    manageQuotas, editQuota,
    manageBookings,
    userMakesBooking,
    manageRequests,
    manageFilters, editFilter, createFilter,
    manageSettings, editSetting,
    bookingConfirmed
}

interface SetPageAction {
    goTo: (p: CurrentPage) => void,
    setParams: (p: any) => void,
    goBack: () => void
}

export const PageContext = createContext<SetPageAction>(
    { goTo: () => { }, setParams: () => { }, goBack: () => { } }
);

export const PageContent = () => {
    //default page
    const userContext = useContext(UserContext);
    const [current, setCurrent] = useState<CurrentPage>(CurrentPage.userMakesBooking);
    const [params, setParams] = useState<any>({});
    const [prev, setPrev] = useState<CurrentPage>(CurrentPage.userMakesBooking);

    return (
        <PageContext.Provider value={{
            goTo: (value: CurrentPage) => {
                setPrev(current);
                setCurrent(value);
            },
            setParams: setParams,
            goBack: () => {
                setCurrent(prev);
            }
        }}>
            <Header />
            {
                current === CurrentPage.editDevice ?
                    <EditDevicePage params={params} />
                    : current === CurrentPage.editUser ?
                        <EditUserPage params={params} />
                        : current === CurrentPage.createUser ?
                            <CreateUserPage />
                            : current === CurrentPage.bookingConfirmed ?
                                <BookingConfirmed />
                                : current === CurrentPage.manageGroups ?
                                    <ManageGroupsPage />
                                    : current === CurrentPage.editGroup ?
                                        <EditGroupPage params={params} />
                                        : current === CurrentPage.createGroup ?
                                            <CreateGroupPage />
                                            : current === CurrentPage.manageQuotas ?
                                                <ManageQuotasPage params={params} />
                                                : current === CurrentPage.editQuota ?
                                                    <EditQuotaPage params={params} />
                                                    : current === CurrentPage.manageBookings ?
                                                        <ManageBookingsPage params={params} />
                                                        : current === CurrentPage.manageFilters ?
                                                            <ManageFiltersPage params={params} />
                                                            : current === CurrentPage.createFilter ?
                                                                <CreateFilterPage params={params} />
                                                                : current === CurrentPage.editFilter ?
                                                                    <EditFilterPage params={params} />
                                                                    : current === CurrentPage.manageSettings ?
                                                                        <ManageSettingsPage />
                                                                        : current === CurrentPage.editSetting ?
                                                                            <EditSettingPage params={params} />
                                                                            : current === CurrentPage.manageRequests ?
                                                                                <ManageRequestsPage params={params} />
                                                                                : current === CurrentPage.userMakesBooking ?
                                                                                    <MakeABookingPage />
                                                                                    :
                                                                                    <MakeABookingPage /> //default
            }
            {
                userContext?.user?.isAdministrator
                    ?
                    <BottomMenu />
                    :
                    <></>
            }
        </PageContext.Provider>
    );
} 