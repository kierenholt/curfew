import { RunResult } from "sqlite3";
import { Db } from "./db";

export class HistoryItem {
    id: number;
    MAC: string;
    domain: string;
    requestedOn: number;

    constructor(id: number, MAC: string, domain: string ,requestedOn: number) {
        this.id = id;
        this.MAC = MAC;
        this.domain = domain;
        this.requestedOn = requestedOn;
    }

    static createTable(): Promise<RunResult> {
        return Db.run(`
            create table history (
                id integer primary key not null,
                MAC text not null,
                domain text not null,
                requestedOn integer not null
            );
        `)
    }

    static create(mac: string, domain: string, requestedOn: Date): Promise<number> {
        return Db.run(`
            insert into history (MAC, domain, requestedOn)
            values ('${mac}', '${domain}', ${requestedOn.valueOf()})
        `)
        .then(result => result.lastID);
    }

    static getById(id: number): Promise<HistoryItem | null> {
        return Db.get(`
            select * from history
            where id = ${id}
        `)
        .then((result:any) => result ? new HistoryItem(result.id, result.MAC, result.domain, result.requestedOn) : null);
    }

    static delete(id: number): Promise<RunResult> {
        return Db.run(`
            delete from history
            where id = ${id}
        `)
    }


}