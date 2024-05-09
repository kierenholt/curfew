import { RunResult } from "sqlite3";
import { Db } from "./db";


export class UserGroup {
    id: number;
    name: string;
    isUnrestricted: boolean;

    constructor(id: number, name: string, isUnrestricted: number) {
        this.id = id;
        this.name = name;
        this.isUnrestricted = (isUnrestricted == 1);
    }

    static seed() {
        let id = this.create("kids", false);
        console.log("group id", id);
    }

    static createTable(): Promise<RunResult> {
        return Db.run(`
            create table userGroup (
                id integer primary key not null,
                name text not null,
                isUnrestricted integer not null
            );
        `)
    }

    static create(name: string, isUnrestricted: boolean): Promise<number> {
        return Db.run(`
            insert into userGroup (name, isUnrestricted)
            values ('${name}', ${isUnrestricted ? 1: 0})
        `)
        .then(result => result.lastID);
    }

    static getById(id: number): Promise<UserGroup | null> {
        return Db.get(`
            select * from userGroup
            where id = ${id}
        `)
        .then((result:any) => result ? new UserGroup(result.id, result.name, result.isUnrestricted): null);
    }

    static updateName(id: number, name: string): Promise<RunResult> {
        return Db.run(`
            update userGroup
            set name = '${name}'
            where id = ${id}
        `)
    }

    static delete(id: number): Promise<RunResult> {
        return Db.run(`
            delete from userGroup
            where id = ${id}
        `)
    }
}