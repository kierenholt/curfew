import { Db } from "./db";
import { RunResult } from "sqlite3";
import { UserGroup } from "./userGroup";

export class FixedSlot {
    id: number;
    groupId: number;
    private _group: Promise<UserGroup> | undefined;
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
                endsOn integer not null,
                FOREIGN KEY(groupId) REFERENCES userGroup(id)
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

    get group(): Promise<UserGroup> {
        if (this._group == undefined) {
            this._group = UserGroup.getById(this.groupId);
        }
        return this._group;
    }

    static getAll(): Promise<FixedSlot[]> {
        return Db.all(`
            select * from fixedSlot
        `)
        .then((result: any) => result.map((r:any) => new FixedSlot(r.id, r.groupId, r.startsOn, r.endsOn)))
    }
}