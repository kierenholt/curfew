import { Database, RunResult } from "sqlite3";
import { Db } from "./db";
import { UserGroup } from "./userGroup";

export class User {
    id: number;
    groupId: number;
    private _group: Promise<UserGroup> | undefined;
    name: string;

    constructor(id: number, groupId: number, name: string) {
        this.id = id;
        this.groupId = groupId;
        this.name = name;
    }

    static createTable(): Promise<void> {
        return Db.exec(`
            create table user (
                id integer primary key not null,
                groupId integer not null,
                name text not null,
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
        return Db.run(`
            insert into user (groupId, name)
            values (${groupId}, '${name}')
        `)
        .then(result => result.lastID);
    }

    static getById(id: number): Promise<User | null> {
        return Db.get(`
            select * from user
            where id = ${id}
        `)
        .then((result:any) => result ?new User(result.id, result.groupId, result.name) : null);
    }

    static updateName(id: number, name: string): Promise<RunResult> {
        return Db.run(`
            update user
            set name = '${name}'
            where id = ${id}
        `)
    }

    static delete(id: number): Promise<RunResult> {
        return Db.run(`
            delete from user
            where id = ${id}
        `)
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
        .then((result: any) => result.map((r:any) => new User(r.id, r.groupId, r.name)))
    }
}