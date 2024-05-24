import { ReactNode, useEffect, useState } from "react";
import { Helpers } from "./helpers";
import { IDevice, IUser, IUserGroup, IDomain, IList, IBooking } from "./types";
import { ManagementIndex } from "./managementPages/ManagementIndex";


// to be copied in the app
export interface RedirectPayload {
    device: IDevice | null;
    owner: IUser | null;
    group: IUserGroup | null;
    domain: IDomain | null;
    list: IList | null;
    bookedSlot: IBooking | null;
    redirectResult: RedirectReason;
    createdOn: Date;
}


//copied into app
export enum RedirectReason {
    notRedirected = 0,
    domainIsBlocked = 4, domainNotInList = 5,
    needsToBook = 6,
    error = 7,
    curfew = 8,
    deviceIsBanned = 9, userIsBanned = 10, groupIsBanned = 11
}

export const RedirectCheck = () => {
    const [payload, setPayload] = useState<RedirectPayload | null>(null)

    useEffect(() => {
        Helpers.get<RedirectPayload>('/api/redirect')
            .then((payload: RedirectPayload) => setPayload(payload))
    }, [])

    return (
        <>
            <ManagementIndex/>
        </>
    )
}