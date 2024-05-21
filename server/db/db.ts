import { AsyncDatabase } from "promised-sqlite3";
import { Database, OPEN_READWRITE, RunResult } from "sqlite3";
import { User } from "./user";
import { Quota } from "./quota";
import { BookedSlot } from "./bookedSlot";
import { Device } from "./device";
import { FixedSlot } from "./fixedSlot";
import { Rule } from "./rule";
import { List } from "./list";
import { UserGroup } from "./userGroup";
import { Domain } from "./domain";
import { HistoryItem } from "./historyItem";



export class Db {
    static connection: AsyncDatabase;

    static init(): Promise<void> {
        return new Promise((resolve, reject) => {
            let db = new Database('curfew.db', 
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
            let db = new Database('curfew.db', async (err: any) => {
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

    static async createTables() {
        await Quota.createTable();
        await BookedSlot.createTable();
        await Device.createTable();
        await Domain.createTable();
        await FixedSlot.createTable();
        await HistoryItem.createTable();
        await List.createTable();
        await Rule.createTable();
        await User.createTable();
        await UserGroup.createTable();
    }

    static async seed() {
        //await BookableSlot.seed();
        await BookedSlot.seed();
        await Device.seed();
        await Domain.seed();
        //await FixedSlot.seed();
        //await HistoryItem.seed();
        await List.seed();
        //await Rule.seed();
        await User.seed();
        await UserGroup.seed();
    }

    static run(sql: string): Promise<RunResult> {
        return this.connection.run(sql);
    }

    static get(sql: string): Promise<any> {
        return this.connection.get(sql);
    }

    static all(sql: string): Promise<any[]> {
        return this.connection.all(sql);
    }

    static exec(sql: string): Promise<void> {
        return this.connection.exec(sql);
    }

}