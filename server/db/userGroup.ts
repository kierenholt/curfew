import { RunResult } from "sqlite3";
import { Db } from "./db";
import { User } from "./user";
import { Helpers } from "../helpers";
import { Quota } from "./quota";


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
        name = Helpers.escapeSingleQuotes(name);
        return Db.run(`
            insert into userGroup (name, isUnrestricted)
            values ('${name}', ${isUnrestricted ? 1: 0})
        `)
        .then(async result => {
            await Quota.createDefault(result.lastID);
            return result.lastID;
        });
    }

    static update(id: number, name: string, isUnrestricted: boolean): Promise<number> {
        name = Helpers.escapeSingleQuotes(name);
        return Db.run(`
            update userGroup
            set name='${name}', 
            isUnrestricted=${isUnrestricted ? 1: 0},
            where id=${id}
        `)
        .then(result => result.lastID);
    }

    static getById(id: number): Promise<UserGroup> {
        return Db.get(`
            select * from userGroup
            where id = ${id}
        `)
        .then((result:any) => new UserGroup(
            result.id, 
            Helpers.unescapeSingleQuotes(result.name), 
            result.isUnrestricted));
    }

    static updateName(id: number, name: string): Promise<RunResult> {
        name = Helpers.escapeSingleQuotes(name);
        return Db.run(`
            update userGroup
            set name = '${name}'
            where id = ${id}
        `)
    }

    static delete(id: number): Promise<number> {
        return Db.run(`
            delete from userGroup
            where id = ${id}
        `)
        .then(async (result: RunResult) => {
            await Quota.deleteAllDays(id);
            return result.changes
        });
    }

    static getAll(): Promise<UserGroup[]> {
        return Db.all(`
            select * from userGroup
        `)
        .then((result: any) => result.map((r:any) => new UserGroup(
            r.id, 
            Helpers.unescapeSingleQuotes(r.name), 
            r.isUnrestricted)))
    }
}