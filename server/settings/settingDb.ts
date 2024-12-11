import { Db } from "../db";
import { Helpers } from "../helpers";
import { RunResult } from "sqlite3";

export enum SettingKey {
    routerAdminPassword = 1,
    lanIp = 2,
}

export class SettingDb {

    static createTable(): Promise<RunResult> {
        return Db.run(`
            create table setting (
                key integer primary key not null,
                value text not null,
                label text not null,
                description text not null
                );
        `)
    }

    key: SettingKey;
    value: string;
    label: string;
    description: string;

    constructor(key: number, value: string, label: string, description: string) {
        this.key = key as SettingKey;
        this.value = value;
        this.label = label;
        this.description = description;
    }

    static async seed() {
        await this.create(SettingKey.routerAdminPassword, process.env.DEFAULT_PASSWORD as string, "router admin password", "password you use to login to router");
        await this.create(SettingKey.lanIp, "192.168.0.67", "curfew ip address", "ip address to connect to curfew");
    }

    static async create(key: SettingKey, value: string, label: string, description: string): Promise<number> {
        return Db.run(`
            insert into setting (key, value, label, description)
            values (${key.valueOf()}, '${Helpers.Sanitise(value)}', '${Helpers.Sanitise(label)}', '${Helpers.Sanitise(description)}')
        `)
        .then(result => result.changes);
    }

    static async set(key: SettingKey, value: string): Promise<number> {
        return Db.run(`
            update setting 
            set value = '${Helpers.Sanitise(value)}'
            where key=${key}
        `)
        .then(result => result.changes);
    }

    static getNumber(key: SettingKey): Promise<number> {
        return Db.get(`
            select value from setting
            where key=${key}
        `)
        .then(result => {
            return Number(result.value)
        });
    }

    static getString(key: SettingKey): Promise<string> {
        return Db.get(`
            select value from setting
            where key=${key}
        `)
        .then(result => Helpers.Unsanitise(result.value));
    }

    static getBool(key: SettingKey): Promise<boolean> {
        return Db.get(`
            select value from setting
            where key=${key}
        `)
        .then(result => result.value === "true");
    }
    
    static getObjectByKey(key: SettingKey): Promise<SettingDb | null> {
        return Db.get(`
            select * from setting
            where key=${key}
        `)
        .then(result => result ? new SettingDb(
            result.key, 
            Helpers.Unsanitise(result.value),
            Helpers.Unsanitise(result.label),
            Helpers.Unsanitise(result.description)) : null);
    }


    static getAll(): Promise<SettingDb[]> {
        return Db.all(`
            select * from setting
            order by key asc
        `)
        .then((result: any) => result.map((r:any) => new SettingDb(
            r.key,
            Helpers.Unsanitise(r.value),
            Helpers.Unsanitise(r.label),
            Helpers.Unsanitise(r.description))))
    }
}