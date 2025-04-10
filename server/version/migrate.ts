import { debuglog } from "util";
import { CurfewDb } from "../db";
import { SettingKey } from "../settings/types";
import { Migration } from "./types";


export class DbMigration {
    db: CurfewDb;
    static migrations: Migration[] = [
        {
            from: "",
            to: "0.0.1",
            func: async (db: CurfewDb) => { 
                await db.settingQuery.create(SettingKey.dbVersion, DbMigration.latestVersion, "db version", "", "");
                await db.connection.run(`
                    create table dnsFlag (
                        domain text primary key not null,
                        hidden integer not null,
                        flagged integer not null
                    );
                `);
            }
        }];

    constructor(db: CurfewDb) {
        this.db = db;
    }

    async updateToLatest() {
        let currentVersion  = await this.getCurrentVersion();
        for (let m of DbMigration.migrations) {
            if (m.from == currentVersion) {
                await m.func(this.db);
                await this.db.settingQuery.set(SettingKey.dbVersion, m.to);
            }
        }
    }

    getCurrentVersion(): Promise<string> {
        return this.db.settingQuery.getString(SettingKey.dbVersion)
            .catch(() => "");
    }

    static get latestVersion(): string {
        let names = DbMigration.migrations.map(m => m.to).sort();
        return names[names.length - 1];
    }
}