import { Helpers } from "../helpers";
import { Db } from "./db";
import { RunResult } from "sqlite3";

export enum SettingKey {
    apiGetRequestLimit = 1,
}

export class Setting {

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
        await this.create(SettingKey.apiGetRequestLimit, 20, "request fetch amount", "number of requests retrieved when you click 'show more'");
    }

    static async create(key: SettingKey, value: Number | string, label: string, description: string): Promise<number> {
        return Db.run(`
            insert into setting (key, value, label, description)
            values (${key.valueOf()}, '${value}', '${Helpers.escapeSingleQuotes(label)}', '${Helpers.escapeSingleQuotes(description)}')
        `)
        .then(result => result.changes);
    }

    static async save(key: SettingKey, value: string): Promise<number> {
        return Db.run(`
            update setting 
            set value = '${Helpers.escapeSingleQuotes(value)}'
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
        .then(result => Helpers.unescapeSingleQuotes(result.value));
    }
    
    static getByKey(key: SettingKey): Promise<Setting | null> {
        return Db.get(`
            select * from setting
            where key=${key}
        `)
        .then(result => result ? new Setting(
            result.key, 
            Helpers.unescapeSingleQuotes(result.value),
            Helpers.unescapeSingleQuotes(result.label),
            Helpers.unescapeSingleQuotes(result.description)) : null);
    }


    static getAll(): Promise<Setting[]> {
        return Db.all(`
            select * from setting
            order by key asc
        `)
        .then((result: any) => result.map((r:any) => new Setting(
            r.key,
            Helpers.unescapeSingleQuotes(r.value),
            Helpers.unescapeSingleQuotes(r.label),
            Helpers.unescapeSingleQuotes(r.description))))
    }
}