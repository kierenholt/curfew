import { RunResult } from "sqlite3";
import { Db } from "./db";
import { RedirectDestination, RedirectReason } from "../redirector";

export class DnsRequest {
    id: number;
    deviceId: string;
    domain: string;
    requestedOn: number;
    redirectReason: RedirectReason;
    redirectDestination: RedirectDestination;

    constructor(id: number, deviceId: string, domain: string ,requestedOn: number, redirectReason: number, redirectDestination: number) {
        this.id = id;
        this.deviceId = deviceId;
        this.domain = domain;
        this.requestedOn = requestedOn;
        this.redirectReason = redirectReason as RedirectReason;
        this.redirectDestination = redirectDestination as RedirectDestination;
    }

    static createTable(): Promise<RunResult> {
        return Db.run(`
            create table request (
                id integer primary key not null,
                deviceId text not null,
                domain text not null,
                requestedOn integer not null,
                redirectReason integer not null,
                redirectDestination integer not null
            );
            create index ix_request_requestedOn on request(deviceId, requestedOn desc);
        `)
    }

    static create(deviceId: string, domain: string, redirectReason: RedirectReason, redirectDestination: RedirectDestination): Promise<number> {
        return Db.run(`
            insert into request (deviceId, domain, requestedOn, redirectReason, redirectDestination)
            values ('${deviceId}', '${domain}', ${new Date().valueOf()}, ${redirectReason.valueOf()}, ${redirectDestination.valueOf()})
        `)
        .then(result => result.lastID);
    }

    static update(id: number, deviceId: string, domain: string, requestedOn: Date, redirectReason: RedirectReason, redirectDestination: RedirectDestination): Promise<number> {
        return Db.run(`
            update request 
            set deviceId='${deviceId}', 
            domain='${domain}', 
            requestedOn=${requestedOn},
            redirectReason=${redirectReason.valueOf()},
            redirectDestination=${redirectDestination.valueOf()}
            where id=${id}
            `)
        .then(result => result.changes);
    }

    static getById(id: number): Promise<DnsRequest | null> {
        return Db.get(`
            select * from request
            where id = ${id}
        `)
        .then((result:any) => result ? new DnsRequest(
            result.id, 
            result.deviceId, 
            result.domain, 
            result.requestedOn, 
            result.redirectReason,
            result.redirectDestination) : null);
    }

    static getAll(): Promise<DnsRequest[]> {
        return Db.all(`
            select * from request
        `)
        .then((result:any) => result.map((r: any) => new DnsRequest(
            r.id, 
            r.deviceId, 
            r.domain, 
            r.requestedOn, 
            r.redirectReason,
            r.redirectDestination)));
    }

    static delete(id: number): Promise<number> {
        return Db.run(`
            delete from request
            where id = ${id}
        `)
        .then((result: RunResult) => result.changes);
    }

    static getByDeviceId(deviceId: string, limit: number, offset: number): Promise<DnsRequest[]> {
        return Db.all(`
            select * from request
            where deviceId = '${deviceId}'
            order by requestedOn desc
            limit ${limit}
            offset ${offset}
        `)
        .then((result:any) => result.map((r:any) => new DnsRequest(
            r.id, 
            r.deviceId, 
            r.domain, 
            r.requestedOn, 
            r.redirectReason,
            r.redirectDestination)));
    }

    static getMostRecentRequest(deviceId: string): Promise<DnsRequest | null> {
        return Db.get(`
            select * from request
            where deviceId = '${deviceId}'
            order by requestedOn desc
            limit 1
        `)
        .then((result:any) => result ? new DnsRequest(
            result.id, 
            result.deviceId, 
            result.domain, 
            result.requestedOn, 
            result.redirectReason,
            result.redirectDestination) : null);
    }
}