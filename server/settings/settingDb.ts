import { Db } from "../db";
import { RunResult } from "sqlite3";

// must be copied over to app
export enum SettingKey {
    routerAdminPassword = 1,
    thisHost = 2,
    pin = 3,
    inactivityLockSecs = 4,
    networkId = 5, //first three octets
    dhcpMinHost = 6, //last octet
    dhcpMaxHost = 7, //last octet
    upstreamDnsServer = 8
}

export class SettingDb {

    static createTable(): Promise<RunResult> {
        return Db.run(`
            create table setting (
                key integer primary key not null,
                value text not null,
                label text not null,
                description text not null,
                warningMessage text not null
                );
        `)
    }

    key: SettingKey;
    value: string;
    label: string;
    description: string;
    warningMessage: string;

    constructor(key: number, value: string, label: string, description: string, warningMessage: string) {
        this.key = key as SettingKey;
        this.value = value;
        this.label = label;
        this.description = description;
        this.warningMessage = warningMessage;
    }

    static async seed() {
        await this.create(SettingKey.routerAdminPassword, process.env.DEFAULT_PASSWORD as string, "router admin password", "password you use to login to router", "");
        await this.create(SettingKey.thisHost, process.env.DEFAULT_THIS_HOST as string, "this ip address (last octet)", "ip address to connect to curfew. e.g. if set to 39 then this ip will become <network id>.39", 
            "if this setting is changed, all devices will need to disconnect and reconnect to the wifi. Do not allow this setting to fall with the dhcp range (below)");
        await this.create(SettingKey.pin, "0000", "pin", "code to access web pages", 
            "make sure you remember the new code before clicking save. if you forget it, there is no way to recover a lost pin.");
        await this.create(SettingKey.inactivityLockSecs, "30", "inactivity lock", "number of seconds of inactivity before screen locks itself, set to zero to disable", "");
        await this.create(SettingKey.networkId, process.env.DEFAULT_NETWORK_ID as string, "network id", "first three octets of the router ip address e.g 192.168.0", "");
        await this.create(SettingKey.dhcpMinHost, process.env.DEFAULT_DHCP_MIN_HOST as string, "DHCP min ip (last octet)", "lower end of the range of ip addresses offered by DHCP (last octet only)", "");
        await this.create(SettingKey.dhcpMaxHost, process.env.DEFAULT_DHCP_MAX_HOST as string, "DHCP max ip (last octet)", "upper end of the range of ip addresses offered by DHCP (last octet only)", "");
        await this.create(SettingKey.upstreamDnsServer, process.env.DEFAULT_DNS_SERVER as string, "upstream DNS server", "IP address of a DNS server", "");
    }

    static async create(key: SettingKey, value: string, label: string, description: string, warningMessage: string): Promise<number> {
        return Db.run(`
            insert into setting (key, value, label, description, warningMessage)
            values (?, ?, ?, ?, ?)
        `, [key.valueOf(), value, label, description, warningMessage])
            .then(result => result.changes);
    }

    static async set(key: SettingKey, value: string): Promise<number> {
        return Db.run(`
            update setting 
            set value = ?
            where key = ?
        `, [value, key.valueOf()])
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
            where key = ?
        `, [key.valueOf()])
            .then(result => {
                if (result == null || !("value" in result)) {
                    throw ("key not found");
                }
                return result.value
            });
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
            where key=?
        `, [key.valueOf()])
            .then(result => result ? new SettingDb(
                result.key,
                result.value,
                result.label,
                result.description,
                result.warningMessage) : null);
    }


    static getAll(): Promise<SettingDb[]> {
        return Db.all(`
            select * from setting
            order by key asc
        `)
            .then((result: any) => result.map((r: any) => new SettingDb(
                r.key,
                r.value,
                r.label,
                r.description, 
                result.warningMessage)))
    }
}