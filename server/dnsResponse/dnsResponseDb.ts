import { AsyncDatabase } from "promised-sqlite3";
import { RunResult } from "sqlite3";
import { DnsResponse } from "./dnsResponse";

export class DnsResponseQuery {
    connection: AsyncDatabase;

    constructor(connection: AsyncDatabase) {
        this.connection = connection;
    }

    createTable(): Promise<RunResult> {
        return this.connection.run(`
            create table dnsResponse (
                id integer primary key not null,
                domain text not null,
                ip text not null,
                createdOn integer not null,
                requesterIp text not null
            );
        `)
    }

    async seed() {
        this.create("www.youtube.com", "1.1.1.11", 1, "00:00:00:00");
        this.create("www.youtube.com", "1.1.1.12", 1, "00:00:00:00");
        this.create("www.youtube-parts.com", "1.1.1.13", 1, "00:00:00:00");
        this.create("www.homework.com", "1.1.1.14", 1, "00:00:00:00");
    }

    async create(domain: string, ip: string, createdOn: number, requesterIp: string): Promise<number> {
        return this.connection.run(`
            insert into dnsResponse (domain, ip, createdOn, requesterIp)
            values (?, ?, ?, ?)
        `, [domain, ip, createdOn, requesterIp])
            .then(result => result.changes);
    }

    // no set
    // static async set(domain: string, ip: string): Promise<number> {
    // }

    getDomainsContaining(needle: string): Promise<DnsResponse[]> {
        return this.connection.all(`
            select domain, ip, createdOn, requesterIp from dnsResponse
            where domain like ?
        `, [`%${needle}%`])
            .then((result: any) => result.map((r: any) => new DnsResponse(
                r.domain,
                r.ip,
                r.createdOn,
                r.requesterIp)))
    }

    deleteOlderThan1Hour(): Promise<number> {
        let olderThan = new Date().valueOf() - 1 * 3600 * 1000; //1 hour
        return this.connection.run(`
            delete from dnsResponse
            where createdOn < ${olderThan}
        `)
            .then((result: RunResult) => result.changes);
    }
}