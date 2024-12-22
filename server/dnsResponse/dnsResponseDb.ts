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
                createdOn integer not null,
                requesterIp text not null
            );
        `)
    }

    // TO DO DELETE OLD ENTRIES

    domain: string;
    ip: string;
    createdOn: number;
    requesterIp: string;

    constructor(domain: string, ip: string, createdOn: number, mac: string) {
        this.domain = domain;
        this.ip = ip;
        this.createdOn = createdOn;
        this.requesterIp = mac;
    }

    static async seed() {
        if (process.env.SEED_DB_ENABLED) {
            this.create("www.youtube.com", "1.1.1.11", 1, "00:00:00:00");
            this.create("www.youtube.com", "1.1.1.12", 1, "00:00:00:00");
            this.create("www.youtube-parts.com", "1.1.1.13", 1, "00:00:00:00");
            this.create("www.homework.com", "1.1.1.14", 1, "00:00:00:00");
        }
    }

    static async create(domain: string, ip: string, createdOn: number, requesterIp: string): Promise<number> {
        return Db.run(`
            insert into dnsResponse (domain, ip, createdOn, requesterIp)
            values (?, ?, ?, ?)
        `, [domain, ip, createdOn, requesterIp])
            .then(result => result.changes);
    }

    // no set
    // static async set(domain: string, ip: string): Promise<number> {
    // }

    static getDomainsContaining(needle: string): Promise<DnsResponseDb[]> {
        return Db.all(`
            select domain, ip, createdOn, requesterIp from dnsResponse
            where domain like ?
        `, [`%${needle}%`])
            .then((result: any) => result.map((r: any) => new DnsResponseDb(
                r.domain,
                r.ip,
                r.createdOn,
                r.requesterIp)))
    }

    static deleteOlderThan1Day(): Promise<number> {
        let olderThan = new Date().valueOf() - 24 * 3600 * 1000; //1 day
        return Db.run(`
            delete from dnsResponse
            where createdOn < ${olderThan}
        `)
            .then((result: RunResult) => result.changes);
    }
}