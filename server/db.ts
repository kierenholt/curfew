import { AsyncDatabase } from "promised-sqlite3";
import { Database, OPEN_READWRITE, RunResult } from "sqlite3";
import { SettingQuery as SettingQuery } from "./settings/settingQuery";
import { DnsQuery } from "./dnsResponse/dnsQuery";
import { KeywordQuery } from "./keyword/keywordQuery";
import { Helpers } from "./utility/helpers";

export class CurfewDb {
    connection: AsyncDatabase;
    static databaseFile = "curfew.db";
    static databaseInMemory = ":memory";
    
    constructor(connection: AsyncDatabase) {
        this.connection = connection;
    }

    get settingQuery() { return new SettingQuery(this.connection); }
    get dnsQuery() { return new DnsQuery(this.connection); }
    get keywordQuery() { return new KeywordQuery(this.connection); }

    static async createTables(connection: AsyncDatabase) {
        await new SettingQuery(connection).createTable();
        await new DnsQuery(connection).createTable();
        await new KeywordQuery(connection).createTable();
    }
    
    static async seed(connection: AsyncDatabase) {
        await new SettingQuery(connection).seed();
        //await new DnsResponseQuery(connection).seed(); //NOT REALLY NEEDED
        await new KeywordQuery(connection).seed();
    }

    static async init(inMemory: boolean = false): Promise<CurfewDb> {
        return new Promise(async (resolve, reject) => {
            if (inMemory) {
                let db = new Database(this.databaseInMemory);
                let connection = new AsyncDatabase(db);
                await this.createTables(connection);
                resolve(new CurfewDb(connection));
            }
            else {
                let db = new Database(this.databaseFile, 
                    OPEN_READWRITE, 
                    async (err: any) => {
                        if (err && err.code == "SQLITE_CANTOPEN") {
                            let db = await this.createDatabase();
                            let connection = new AsyncDatabase(db);
                            await this.createTables(connection);
                            await this.seed(connection);
                            resolve(new CurfewDb(connection));
                        } else if (err) {
                            console.log("Error opening database: " + err);
                            reject();
                        }
                        else {
                            let connection = new AsyncDatabase(db);
                            resolve(new CurfewDb(connection));
                        }
                    });
            }
        })
    }

    static createDatabase(): Promise<Database> {
        return new Promise((resolve, reject) => {
            let db = new Database(this.databaseFile, async (err: any) => {
                if (err) {
                    console.log("Error creating database: " + err);
                    reject()
                }
                resolve(db);
            });
        })
    }

    async getAllBlockedIPsAndPorts(): Promise<[string[], [number, number][]]> {
        let ips: string[] = [];
        let ports: [number, number][] = [];
        let terms = await this.keywordQuery.getAllActive();
        for (let t of terms) {
            for (let n of t.needles) {
                let matchingDomains = await this.dnsQuery.getRequestedDomainsContaining(n);
                ips.push(...matchingDomains.map(d => d.ip));
            }
            if (t.portsArray) ports.push(...t.portsArray);
        }
        return [Helpers.removeDuplicates(ips), Helpers.removeDuplicates(ports)];
    }

    async getBlockedIpsOfKeyword(keywordId: number): Promise<string[]> {
        let ips: string[] = [];
        let keyword = await this.keywordQuery.getById(keywordId);
        if (keyword == null) {
            return [];
        }
        for (let n of keyword.needles) {
            let matchingDomains = await this.dnsQuery.getRequestedDomainsContaining(n);
            ips.push(...matchingDomains.map(d => d.ip));
        }
        return Helpers.removeDuplicates(ips);
    }
}