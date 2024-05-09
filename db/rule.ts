import { RunResult } from "sqlite3";
import { Db } from "./db";

export class Rule {
    id: number;
    groupId: number;

    constructor(id: number, groupId: number) {
        this.id = id;
        this.groupId = groupId;
    }

    static createTable(): Promise<RunResult> {
        return Db.run(`
            create table rule (
                id integer primary key not null,
                groupId integer not null
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
}