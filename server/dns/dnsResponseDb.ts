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

    static async seed() {
        if (process.env.SEED_DB_ENABLED) {
            this.create("www.youtube.com", "1.1.1.11", 1);
            this.create("www.youtube.com", "1.1.1.12", 1);
            this.create("www.youtube-parts.com", "1.1.1.13", 1);
            this.create("www.homework.com", "1.1.1.14", 1);
        }
    }

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
        return Db.all(`
            select domain, ip, createdOn from dnsResponse
            where domain like '%${needle}%'
        `)
            .then((result: any) => result.map((r: any) => new DnsResponseDb(
                Helpers.Unsanitise(r.domain),
                r.ip,
                r.createdOn)))

    }
}