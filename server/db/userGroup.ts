import { RunResult } from "sqlite3";
import { Db } from "./db";
import { User } from "./user";
import { Helpers } from "../helpers";
import { Quota } from "./quota";


export class UserGroup {
    id: number;
    name: string;
    isUnrestricted: boolean;
    isBanned: boolean;
    users?: User[];

    static FIRST_GROUP_ID: number = 1;

    constructor(id: number, name: string, isUnrestricted: number, isBanned: number) {
        this.id = id;
        this.name = name;
        this.isUnrestricted = (isUnrestricted == 1);
        this.isBanned = (isBanned == 1);
    }

    static async seed() {
        await this.create("kids", false); //id 1
        await this.create("adults", true); //id 2
        await this.create("things", true); //id 3
    }

    static createTable(): Promise<RunResult> {
        return Db.run(`
            create table userGroup (
                id integer primary key not null,
                name text not null,
                isUnrestricted integer not null,
                isBanned integer default 0 not null
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
            isUnrestricted=${isUnrestricted ? 1: 0}
            where id=${id}
        `)
        .then(result => result.changes);
    }

    static getById(id: number): Promise<UserGroup> {
        return Db.get(`
            select * from userGroup
            where id = ${id}
        `)
        .then((result:any) => new UserGroup(
            result.id, 
            Helpers.unescapeSingleQuotes(result.name), 
            result.isUnrestricted,
            result.isBanned));
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
        if (id == this.FIRST_GROUP_ID) {
            return Promise.resolve(0); //must not delete unknown group
        }
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
            r.isUnrestricted,
            r.isBanned)))
    }

    static setBan(groupId: number, isBanned: number): Promise<number> {
        return Db.run(`
            update userGroup
            set isBanned = ${isBanned}
            where id = ${groupId}
        `)
        .then((result: RunResult) => result.changes);
    }
}