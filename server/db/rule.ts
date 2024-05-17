import { RunResult } from "sqlite3";
import { Db } from "./db";
import { UserGroup } from "./userGroup";

export class Rule {
    id: number;
    groupId: number;
    private _group: Promise<UserGroup> | undefined;

    constructor(id: number, groupId: number) {
        this.id = id;
        this.groupId = groupId;
    }

    static createTable(): Promise<RunResult> {
        return Db.run(`
            create table rule (
                id integer primary key not null,
                groupId integer not null,
                FOREIGN KEY(groupId) REFERENCES userGroup(id)
            );
        `)
    }

    static create(groupId: number): Promise<number> {
        return Db.run(`
            insert into rule (groupId)
            values (${groupId})
        `)
        .then(result => result.lastID);
    }

    static getById(id: number): Promise<Rule | null> {
        return Db.get(`
            select * from rule
            where id = ${id}
        `)
        .then((result:any) => result ? new Rule(result.id, result.groupId) : null);
    }

    static delete(id: number): Promise<RunResult> {
        return Db.run(`
            delete from rule
            where id = ${id}
        `)
    }

    get group(): Promise<UserGroup> {
        if (this._group == undefined) {
            this._group = UserGroup.getById(this.groupId);
        }
        return this._group;
    }

    static getAll(): Promise<Rule[]> {
        return Db.all(`
            select * from rule
        `)
        .then((result: any) => result.map((r:any) => new Rule(r.id, r.groupId)))
    }
}