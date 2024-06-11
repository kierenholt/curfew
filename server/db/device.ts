import { RunResult } from "sqlite3";
import { Db } from "./db";
import { User } from "./user";
import { Helpers } from "../helpers";

export class Device {
    id: string;
    ownerId: number;
    name: string;
    private _owner: Promise<User | null> | undefined;
    isBanned: boolean;
    isDeleted: boolean;

    constructor(id: string, ownerId: number, name: string, isBanned: number, isDeleted: number) {
        this.id = id;
        this.ownerId = ownerId;
        this.name = name;
        this.isBanned = (isBanned == 1);
        this.isDeleted = (isDeleted == 1);
    }

    static createTable(): Promise<RunResult> {
        return Db.run(`
            create table device (
                id text primary key not null,
                ownerId integer not null,
                name text not null,
                isBanned integer default 0 not null,
                isDeleted integer default 0 not null,
                FOREIGN KEY(ownerId) REFERENCES user(id)
            );
        `)
    }

    static seed() {
    }

    static create(id: string, ownerId: number, name: string): Promise<number> {
        name = Helpers.escapeSingleQuotes(name);
        return Db.run(`
            insert into device (id, ownerId, name)
            values ('${id}', ${ownerId}, '${name}')
            on conflict(id) do nothing
        `)
        .then(result => result.lastID ?? id);
    }

    static update(id: string, ownerId: number, name: string): Promise<number> {
        name = Helpers.escapeSingleQuotes(name);
        return Db.run(`
            update device 
            set ownerId=${ownerId}, 
            name='${name}'
            where id='${id}'
        `)
        .then(result => result.changes);
    }

    static getById(id: string): Promise<Device | null> {
        return Db.get(`
            select * from device
            where id = '${id}'
        `)
        .then((result:any) => result ? new Device(
            result.id, 
            result.ownerId, 
            Helpers.unescapeSingleQuotes(result.name),
            result.isBanned,
            result.isDeleted
            ) : null);
    }

    static getByOwnerId(ownerId: number, includeDeleted = false): Promise<Device[]> {
        return Db.all(`
            select * from device
            where ownerId='${ownerId}'
            ${includeDeleted ? "" : "and isDeleted=0"}
        `)
        .then((result: any) => result.map((r:any) => new Device(
            r.id, 
            r.ownerId, 
            Helpers.unescapeSingleQuotes(r.name),
            r.isBanned,
            r.isDeleted
        )))
    }

    static updateOwner(id: string, ownerId: number): Promise<number> {
        return Db.run(`
            update device
            set ownerId = ${ownerId}
            where id = '${id}'
        `)
        .then((result: RunResult) => result.changes);
    }

    static setDeleted(id: string, value: number): Promise<number> {
        return Db.run(`
            update device
            set isDeleted=${value}
            where id = '${id}'
        `)
        .then((result: RunResult) => result.changes);
    }

    get owner(): Promise<User | null> {
        if (this._owner == undefined) {
            this._owner = User.getById(this.ownerId);
        }
        return this._owner;
    }

    static getAll(includeDeleted = false): Promise<Device[]> {
        return Db.all(`
            select * from device
            ${includeDeleted ? "" : " where isDeleted=0 "}
        `)
        .then((result: any) => result.map((r:any) => new Device(
            r.id, 
            r.ownerId, 
            Helpers.unescapeSingleQuotes(r.name),
            r.isBanned,
            r.isDeleted
            )))
    }

    static setBan(deviceId: string, isBanned: number): Promise<number> {
        return Db.run(`
            update device
            set isBanned = ${isBanned}
            where id = '${deviceId}'
        `)
        .then((result: RunResult) => result.changes);
    }
}