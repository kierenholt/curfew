import { Helpers } from "../helpers";
import { Db } from "./db";
import { RunResult } from "sqlite3";

export enum SettingKey {
    apiGetRequestLimit = 1,
    groupRequests = 2,
    requestExpiryDays = 3,
    showNonAdminsNameChangeLink = 4,
    viewDeleted = 5,
    groupByFilterType = 6
    //remember to add true/false to editsettings page
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
        await this.create(SettingKey.apiGetRequestLimit, "20", "'get more button' fetches .. requests each time", "number of requests retrieved when you click 'show more'");
        await this.create(SettingKey.groupRequests, "true", "group requests by domain name", "if enabled, requests are listed in groups by domain name");
        await this.create(SettingKey.requestExpiryDays, "5", "delete requests after .. days", "how long a request is stored in the database before scheduled deletion");
        await this.create(SettingKey.showNonAdminsNameChangeLink, "1", "allow name change from home page", "when you click the name or device on the homepage, an edit page will show. Best to disable this once everything is set up.");
        await this.create(SettingKey.viewDeleted, "0", "view deleted devices, users and groups", "if enabled, deleted items will show up on the groups page");
        await this.create(SettingKey.groupByFilterType, "0", "group requests by filter type", "if enabled, requests are listed in groups by the filter type");
    }

    static async create(key: SettingKey, value: string, label: string, description: string): Promise<number> {
        return Db.run(`
            insert into setting (key, value, label, description)
            values (${key.valueOf()}, '${Helpers.escapeSingleQuotes(value)}', '${Helpers.escapeSingleQuotes(label)}', '${Helpers.escapeSingleQuotes(description)}')
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

    static getBool(key: SettingKey): Promise<boolean> {
        return Db.get(`
            select value from setting
            where key=${key}
        `)
        .then(result => result.value === "true");
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