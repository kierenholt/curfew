import { Database, RunResult } from "sqlite3";
import { Db } from "./db";
import { UserGroup } from "./userGroup";
import { Helpers } from "../helpers";

export class User {
    id: number;
    groupId: number;
    private _group: Promise<UserGroup> | undefined;
    name: string;
    isBanned: boolean;

    constructor(id: number, groupId: number, name: string, isBanned: number) {
        this.id = id;
        this.groupId = groupId;
        this.name = name;
        this.isBanned = isBanned == 1;
    }

    static createTable(): Promise<void> {
        return Db.exec(`
            create table user (
                id integer primary key not null,
                groupId integer not null,
                name text not null,
                isBanned integer default 0 not null,
                FOREIGN KEY(groupId) REFERENCES userGroup(id)
            );
        `)
    }

    static async seed() {
        await this.create(1, "Gisele");
        await this.create(1, "Arthur");
        await this.create(1, "Eddie");
    }

    static create(groupId: number, name: string): Promise<number> {
        name = Helpers.escapeSingleQuotes(name);
        return Db.run(`
            insert into user (groupId, name)
            values (${groupId}, '${name}')
        `)
        .then(result => result.lastID);
    }

    static update(id: number, groupId: number, name: string): Promise<number> {
        name = Helpers.escapeSingleQuotes(name);
        return Db.run(`
            update user 
            set groupId=${groupId}, 
            name='${name}',
            where id=${id}
        `)
        .then(result => result.lastID);
    }

    static getById(id: number): Promise<User | null> {
        return Db.get(`
            select * from user
            where id = ${id}
        `)
        .then((result:any) => result == null ? null : new User(
            result.id, 
            result.groupId, 
            Helpers.unescapeSingleQuotes(result.name),
            result.isBanned
            ));
    }

    static updateName(id: number, name: string): Promise<number> {
        name = Helpers.escapeSingleQuotes(name);
        return Db.run(`
            update user
            set name = '${name}'
            where id = ${id}
        `)
        .then((result: RunResult) => result.changes);
    }

    static delete(id: number): Promise<number> {
        return Db.run(`
            delete from user
            where id = ${id}
        `)
        .then((result: RunResult) => result.changes);
    }

    get group(): Promise<UserGroup> {
        if (this._group == undefined) {
            this._group = UserGroup.getById(this.groupId);
        }
        return this._group;
    }

    static getAll(): Promise<User[]> {
        return Db.all(`
            select * from user
        `)
        .then((result: any) => result.map((r:any) => new User(
            r.id, 
            r.groupId, 
            Helpers.unescapeSingleQuotes(r.name),
            r.isBanned
            )))
    }

    static setBan(userId: number, isBanned: number): Promise<number> {
        return Db.run(`
            update user
            set isBanned = ${isBanned}
            where id = ${userId}
        `)
        .then((result: RunResult) => result.changes);
    }
}