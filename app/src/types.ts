
export interface IUserGroup {
    id: number;
    name: string;
    isUnrestricted: boolean;
    isBanned: boolean;
}


export interface IUser {
    id: number;
    groupId: number;
    name: string;
    isBanned: boolean;
}


export interface IRule {
    id: number;
    groupId: number;
}

export enum FilterAction {
    alwaysBlock = 0, alwaysAllow = 1, needsSlot = 2 
}

export interface IList {
    id: number;
    name: string;
    filterAction: FilterAction;
}


export interface IHistoryItem {
    id: number;
    MAC: string;
    domain: string;
    requestedOn: number;
}


export interface IFixedSlot {
    id: number;
    groupId: number;
    startsOn: number;
    endsOn: number;
}

export interface IDomain {
    id: number;
    component: string;
    listId: number;
}


export interface IDevice {
    id: string;
    ownerId: number;
    name: string;
    isBanned: boolean;
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
    startsOn: Date;
    userId: number;
    groupId: number;
    day: number;
    duration: number;
    cooldown: number;
}