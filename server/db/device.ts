import { RunResult } from "sqlite3";
import { Db } from "./db";
import { User } from "./user";

export class Device {
    MAC: string;
    ownerId: number;
    name: string;
    static SAMSUNG_MAC: string = "ba:cc:ba:1a:1d:41"; 
    private _owner: Promise<User | null> | undefined;

    constructor(MAC: string, ownerId: number, name: string) {
        this.MAC = MAC;
        this.ownerId = ownerId;
        this.name = name;
    }

    static createTable(): Promise<RunResult> {
        return Db.run(`
            create table device (
                MAC text primary key not null,
                ownerId integer not null,
                name text not null,
                FOREIGN KEY(ownerId) REFERENCES user(id)
            );
        `)
    }

    static seed() {
        this.create(this.SAMSUNG_MAC, 2, "kieren's samsung");
    }

    static create(MAC: string, ownerId: number, name: string): Promise<number> {
        return Db.run(`
            insert into device (MAC, ownerId, name)
            values ('${MAC}', ${ownerId} '${name}')
        `)
        .then(result => result.lastID);
    }

    static update(MAC: string, ownerId: number, name: string): Promise<number> {
        return Db.run(`
            update device 
            set ownerId=${ownerId}, 
            name='${name}'
            where MAC='${MAC}'
        `)
        .then(result => result.lastID);
    }

    static getByMac(MAC: string): Promise<Device | null> {
        return Db.get(`
            select * from device
            where MAC = '${MAC}'
        `)
        .then((result:any) => result ? new Device(result.MAC, result.ownerId, result.name) : null);
    }

    static updateOwner(mac: string, ownerId: number): Promise<RunResult> {
        return Db.run(`
            update device
            set ownerId = ${ownerId}
            where MAC = '${mac}'
        `)
    }

    static delete(MAC: string): Promise<RunResult> {
        return Db.run(`
            delete from device
            where MAC = '${MAC}'
        `)
    }

    get owner(): Promise<User | null> {
        if (this._owner == undefined) {
            this._owner = User.getById(this.ownerId);
        }
        return this._owner;
    }

    static getAll(): Promise<Device[]> {
        return Db.all(`
            select * from device
        `)
        .then((result: any) => result.map((r:any) => new Device(r.MAC, r.ownerId, r.name)))
    }
}