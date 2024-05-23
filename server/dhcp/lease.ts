import { Helpers } from "../helpers";

export enum LeaseState { offered = 0, active = 1, expired = 2 }

export class Lease {
    MAC: string;
    deviceId: string;
    IP: string;
    state: LeaseState;
    expires: number;
    static lifetime: number = 86400;
    mostRecentTransactionId: number;
    hostname: string;

    constructor(MAC: string, IP: string, mostRecentTransactionId: number, hostname: string) {
        this.MAC = MAC;
        this.IP = IP;
        this.state = LeaseState.active;
        this.expires = new Date().valueOf() + Lease.lifetime;
        this.mostRecentTransactionId = mostRecentTransactionId;
        this.deviceId = Helpers.MACtoDeviceId(MAC);
        this.hostname = hostname;
    }
}