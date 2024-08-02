import { AsyncDatabase } from "promised-sqlite3";
import { Database, OPEN_READWRITE, RunResult } from "sqlite3";
import { User } from "./user";
import { Quota } from "./quota";
import { Booking } from "./booking";
import { Device } from "./device";
import { FixedSlot } from "./fixedSlot";
import { UserGroup } from "./userGroup";
import { Filter } from "./filter";
import { DnsRequest } from "./dnsRequest";
import { Setting } from "./setting";



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
        await Booking.createTable();
        await Device.createTable();
        await Filter.createTable();
        await FixedSlot.createTable();
        await DnsRequest.createTable();
        await User.createTable();
        await UserGroup.createTable();
        await Setting.createTable();
    }

    static async seed() {
        await Booking.seed();
        await Device.seed();
        await Filter.seed();
        await User.seed();
        await UserGroup.seed();
        await Setting.seed();
    }

    static run(sql: string): Promise<RunResult> {
        console.log(sql);
        return this.connection.run(sql);
    }

    static get(sql: string): Promise<any> {
        console.log(sql);
        return this.connection.get(sql);
    }

    static all(sql: string): Promise<any[]> {
        console.log(sql);
        return this.connection.all(sql);
    }

    static exec(sql: string): Promise<void> {
        console.log(sql);
        return this.connection.exec(sql);
    }

}