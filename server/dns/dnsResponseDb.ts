import { Db } from "../db";
import { Helpers } from "../helpers";
import { RunResult } from "sqlite3";

export class DnsResponseDb {

    static createTable(): Promise<RunResult> {
        return Db.run(`
            create table dnsResponse (
                id integer primary key not null,
                domain text not null,
                ip text not null,
                createdOn integer not null
            );
        `)
    }

    // TO DO DELETE OLD ENTRIES

    domain: string;
    ip: string;
    createdOn: number;

    constructor(domain: string, ip: string, createdOn: number) {
        this.domain = domain;
        this.ip = ip;
        this.createdOn = createdOn;
    }

    // no seeding
    // static async seed() {
    // }

    static async create(domain: string, ip: string, createdOn: number): Promise<number> {
        return Db.run(`
            insert into dnsResponse (domain, ip, createdOn)
            values ('${Helpers.Sanitise(domain)}', '${ip}', ${createdOn})
        `)
        .then(result => result.changes);
    }

    // no set
    // static async set(domain: string, ip: string): Promise<number> {
    // }

    static getDomainsContaining(needle: string): Promise<DnsResponseDb[]> {
        return Db.get(`
            select * from dnsResponse
            where domain like '%${needle}%'
        `)
        .then((result: any) => result.map((r:any) => new DnsResponseDb(
            Helpers.Unsanitise(r.domain),
            r.ip,
            r.createdOn)))
    }
}