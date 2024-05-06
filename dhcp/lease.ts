
export enum LeaseState { offered = 0, active = 1, expired = 2 }

export class Lease {
    MAC: string;
    IP: string;
    state: LeaseState;
    expires: number;
    static lifetime: number = 86400;
    mostRecentTransactionId: number;

    constructor(MAC: string, IP: string, mostRecentTransactionId: number) {
        this.MAC = MAC;
        this.IP = IP;
        this.state = LeaseState.active;
        this.expires = new Date().valueOf() + Lease.lifetime;
        this.mostRecentTransactionId = mostRecentTransactionId;
    }
}