import { RunResult } from "sqlite3";
import { Db } from "./db";

export class Device {
    MAC: string;
    ownerId: number;
    static SAMSUNG_MAC: string = "ba:cc:ba:1a:1d:41"; 

    constructor(MAC: string, ownerId: number) {
        this.MAC = MAC;
        this.ownerId = ownerId;
    }

    static createTable(): Promise<RunResult> {
        return Db.run(`
            create table device (
                MAC text primary key not null,
                ownerId integer not null
            );
        `)
    }

    static seed() {
        this.create(this.SAMSUNG_MAC, 2);
    }

    static create(MAC: string, ownerId: number): Promise<number> {
        return Db.run(`
            insert into device (MAC, ownerId)
            values ('${MAC}', ${ownerId})
        `)
        .then(result => result.lastID);
    }

    static getByMac(MAC: string): Promise<Device | null> {
        return Db.get(`
            select * from device
            where MAC = '${MAC}'
        `)
        .then((result:any) => result ? new Device(result.MAC, result.ownerId) : null);
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
}