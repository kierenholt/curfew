import { AsyncDatabase } from "promised-sqlite3";
import { RunResult } from "sqlite3";
import { DnsFlag, DnsResponse, DnsResponseWithFlag } from "./types";

export class DnsQuery {
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
        `).then(
            () => this.connection.run(`
                create table dnsFlag (
                    domain text primary key not null,
                    hidden integer not null,
                    flagged integer not null
                );
            `)
        )
    }

    async seed() {
        this.createResponse("www.youtube.com", "1.1.1.11", 1, "00:00:00:00");
        this.createResponse("www.youtube.com", "1.1.1.12", 1, "00:00:00:00");
        this.createResponse("www.youtube-parts.com", "1.1.1.13", 1, "00:00:00:00");
        this.createResponse("www.homework.com", "1.1.1.14", 1, "00:00:00:00");
    }

    async createResponse(domain: string, ip: string, createdOn: number, requesterIp: string): Promise<number> {
        return this.connection.run(`
            insert into dnsResponse (domain, ip, createdOn, requesterIp)
            values (?, ?, ?, ?)
        `, [domain, ip, createdOn, requesterIp])
            .then(result => result.changes);
    }

    // no set
    // static async set(domain: string, ip: string): Promise<number> {
    // }

    getRequestedDomainsContaining(needle: string): Promise<DnsResponse[]> {
        return this.connection.all(`
            select domain, ip, createdOn, requesterIp from dnsResponse
            where domain like ?
        `, [`%${needle}%`])
            .then((result: any) => result.map((r: any) => r as DnsResponse))
    }

    deleteResponsesOlderThan1Hour(): Promise<number> {
        let olderThan = new Date().valueOf() - 1 * 3600 * 1000; //1 hour
        return this.connection.run(`
            delete from dnsResponse
            where createdOn < ${olderThan}
        `)
            .then((result: RunResult) => result.changes);
    }

    getAllResponsesWithFlags(): Promise<DnsResponseWithFlag[]> {
        return this.connection.all(`
            select dnsResponse.domain, ip, createdOn, requesterIp, dnsFlag.flagged, dnsFlag.hidden from dnsResponse
            left outer join dnsFlag on dnsResponse.domain = dnsFlag.domain
        `)
            .then((result: any) => {
                return result.map((r: any) => r as DnsResponseWithFlag)
            })
    }

    setDomainHidden(domainName: string, value: number): Promise<number> {
        return this.connection.get(`
            select * from dnsFlag
            where domain=?
        `, domainName)
            .then((result: any) => {
                if (result == null || result.length == 0) {
                    return this.connection.run(`
                        insert into dnsFlag (domain, hidden, flagged)
                        values (?, ?, 0)
                        `, [domainName, value]);
                }
                else {
                    return this.connection.run(`
                        update dnsFlag 
                        set hidden=?
                        where domain=?
                        `, [value, domainName]);
                }
            })
            .then(result => result.changes);
    }

    setDomainFlagged(domainName: string, value: number): Promise<number> {
        return this.connection.get(`
            select * from dnsFlag
            where domain=?
        `, domainName)
            .then((result: any) => {
                if (result == null || result.length == 0) {
                    return this.connection.run(`
                        insert into dnsFlag (domain, hidden, flagged)
                        values (?, 0, ?)
                        `, [domainName, value]);
                }
                else {
                    return this.connection.run(`
                        update dnsFlag 
                        set flagged=?
                        where domain=?
                        `, [value, domainName]);
                }
            })
            .then(result => result.changes);
    }
}