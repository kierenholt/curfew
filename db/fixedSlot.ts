import { Db } from "./db";
import { RunResult } from "sqlite3";

export class FixedSlot {
    id: number;
    groupId: number;
    startsOn: number;
    endsOn: number;

    constructor(id: number, groupId: number, startsOn: number, endsOn: number) {
        this.id = id;
        this.groupId = groupId;
        this.startsOn = startsOn;
        this.endsOn = endsOn;
    }

    static createTable(): Promise<RunResult> {
        return Db.run(`
            create table slot (
                id integer primary key not null,
                groupId integer not null,
                startsOn integer not null,
                endsOn integer not null
            );
        `)
    }

    static create(groupId: string, startsOn: Date, endsOn: Date): Promise<number> {
        return Db.run(`
            insert into slot (groupId, startsOn, endsOn)
            values (${groupId}, ${startsOn}, ${endsOn})
        `)
        .then(result => result.lastID);
    }

    static getById(id: number): Promise<FixedSlot | null> {
        return Db.get(`
            select * from slot
            where id = ${id}
        `)
        .then((result:any) => result ? new FixedSlot(result.id, result.groupId, result.startsOn, result.endsOn) : null);
    }

    static delete(id: number): Promise<RunResult> {
        return Db.run(`
            delete from slot
            where id = ${id}
        `)
    }
}