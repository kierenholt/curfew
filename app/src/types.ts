
export interface IUserGroup {
    id: number;
    name: string;
    isUnrestricted: boolean;
    isBanned: boolean;
    hasUsers?: boolean;
}


export interface IUser {
    id: number;
    groupId: number;
    name: string;
    isBanned: boolean;
    isAdministrator: boolean;
    hasDevices?: boolean;
}


export interface IList {
    id: number;
    name: string;
    filterAction: FilterAction;
}



export interface IFixedSlot {
    id: number;
    groupId: number;
    startsOn: number;
    endsOn: number;
}

export interface IFilter {
    id: number;
    component: string;
    groupId: number;
    action: FilterAction;
}


export enum FilterAction {
    alwaysAllow = 1, needsBooking = 2, alwaysDeny = 3
}



export interface IDevice {
    id: string;
    ownerId: number;
    name: string;
    isBanned: boolean;
    lastRequestedOn?: number;
}

export interface IQuota {
    groupId: number;
    day: number;

    refreshAmount: number;
    rollsOver: boolean;
    maxDuration: number;
    cooldown: number;
}

export interface IBooking {
    id: number;
    startsOn: number;
    userId: number;
    groupId: number;
    day: number;
    endsOn: number;
    cooldown: number;
    duration: number;
}

export interface IRequest {
    id: number;
    deviceId: string;
    domain: string;
    requestedOn: number;
    redirectReason: RedirectReason;
    redirectDestination: RedirectDestination;
} 

//copied into app
export enum RedirectReason {
    error = 0,
    curfew = 1,
    domainIsAlwaysAllowed = 10, domainIsAlwaysBlocked = 11,
    filterNotFound = 12,
    needsToBook = 13, hasBooked = 14,
    deviceIsBanned = 21, userIsBanned = 22, groupIsBanned = 23
}

export enum RedirectDestination {
    app = 1, blocked = 0, allow = 2
}