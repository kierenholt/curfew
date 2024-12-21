import { AsyncDatabase } from "promised-sqlite3";
import { Database, OPEN_READWRITE, RunResult } from "sqlite3";
import { SettingDb } from "./settings/settingDb";
import { DnsResponseDb } from "./dnsResponse/dnsResponseDb";
import { KeywordDb } from "./keyword/keywordDb";

export class Db {
    static connection: AsyncDatabase;

    static async createTables() {
        await SettingDb.createTable();
        await DnsResponseDb.createTable();
        await KeywordDb.createTable();
    }

    static async seed() {
        await SettingDb.seed();
        await DnsResponseDb.seed();
        await KeywordDb.seed();
    }

    static init(): Promise<void> {
        return new Promise((resolve, reject) => {
            let db = new Database(process.env.DATABASE_NAME as string, 
                OPEN_READWRITE, 
                async (err: any) => {
                    if (err && err.code == "SQLITE_CANTOPEN") {
                        await this.createDatabase();
                        resolve();
                    } else if (err) {
                        console.log("db error " + err);
                        reject();
                    }
                    else {
                        resolve();
                    }
                });
            this.connection = new AsyncDatabase(db);
        })
    }

    static createDatabase(): Promise<void> {
        return new Promise((resolve, reject) => {
            let db = new Database(process.env.DATABASE_NAME as string, async (err: any) => {
                if (err) {
                    console.log("Getting error " + err);
                    reject()
                }
                await this.createTables();
                await this.seed();
                resolve();
            });
            this.connection = new AsyncDatabase(db);
        })
    }

    static run(sql: string, params: any = []): Promise<RunResult> {
        //console.log(sql);
        return this.connection.run(sql, params);
    }

    static get(sql: string, params: any = []): Promise<any> {
        // console.log(sql);
        return this.connection.get(sql, params);
    }

    static all(sql: string, params: any = []): Promise<any[]> {
        // console.log(sql);
        return this.connection.all(sql, params);
    }
}