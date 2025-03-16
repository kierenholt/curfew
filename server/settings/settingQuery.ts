import { AsyncDatabase } from "promised-sqlite3";
import { RunResult } from "sqlite3";
import { Setting, SettingKey } from "./setting";
import { ModelName, RouterOptions } from "../router/routerProvider";
import { Helpers } from "../utility/helpers";
import { IscDhcpOptions } from "../net/dhcp";

export class SettingQuery {

    connection: AsyncDatabase;

    constructor(connection: AsyncDatabase) {
        this.connection = connection;
    }

    createTable(): Promise<RunResult> {
        return this.connection.run(`
            create table setting (
                key integer primary key not null,
                value text not null,
                label text not null,
                description text not null,
                warningMessage text not null
                );
        `)
    }

    async seed() {
        await this.create(SettingKey.routerAdminPassword, "", "router admin password", "password you use to login to router", "");
        await this.create(SettingKey.thisHost, process.env.DEFAULT_THIS_HOST as string, "this ip address (last octet)", "ip address to connect to curfew. e.g. if set to 39 then this ip will become <network id>.39", 
            "if this setting is changed, all devices will need to disconnect and reconnect to the wifi. Do not allow this setting to fall with the dhcp range (below)");
        await this.create(SettingKey.pin, "0000", "pin", "code to access web pages", 
            "make sure you remember the new code before clicking save. if you forget it, there is no way to recover a lost pin.");
        await this.create(SettingKey.inactivityLockSecs, "30", "inactivity lock", "number of seconds of inactivity before screen locks itself, set to zero to disable", "");
        await this.create(SettingKey.networkId, "", "network id", "first three octets of the router ip address e.g 192.168.0", "");
        await this.create(SettingKey.dhcpMinHost, process.env.DEFAULT_DHCP_MIN_HOST as string, "DHCP min ip (last octet)", "lower end of the range of ip addresses offered by DHCP (last octet only)", "");
        await this.create(SettingKey.dhcpMaxHost, process.env.DEFAULT_DHCP_MAX_HOST as string, "DHCP max ip (last octet)", "upper end of the range of ip addresses offered by DHCP (last octet only)", "");
        await this.create(SettingKey.upstreamDnsServer, process.env.DEFAULT_DNS_SERVER as string, "upstream DNS server", "IP address of a DNS server", "");
        await this.create(SettingKey.routerModel, ModelName.None, "active router", "the router model that was detected on your network", "");
    }

    async create(key: SettingKey, value: string, label: string, description: string, warningMessage: string): Promise<number> {
        return this.connection.run(`
            insert into setting (key, value, label, description, warningMessage)
            values (?, ?, ?, ?, ?)
        `, [key.valueOf(), value, label, description, warningMessage])
            .then(result => result.changes);
    }

    async set(key: SettingKey, value: string): Promise<number> {
        return this.connection.run(`
            update setting 
            set value = ?
            where key = ?
        `, [value, key.valueOf()])
            .then(result => result.changes);
    }

    getNumber(key: SettingKey): Promise<number> {
        return this.connection.get(`
            select value from setting
            where key=${key}
        `)
            .then((result: any) => {
                return Number(result.value)
            });
    }

    getString(key: SettingKey): Promise<string> {
        return this.connection.get(`
            select value from setting
            where key = ?
        `, [key.valueOf()])
            .then((result: any) => {
                if (result == null || !("value" in result)) {
                    throw ("key not found");
                }
                return result.value
            });
    }

    getBool(key: SettingKey): Promise<boolean> {
        return this.connection.get(`
            select value from setting
            where key=${key}
        `)
            .then((result: any) => result.value === "true");
    }

    getObjectByKey(key: SettingKey): Promise<Setting | null> {
        return this.connection.get(`
            select * from setting
            where key=?
        `, [key.valueOf()])
            .then((result: any) => result ? new Setting(
                result.key,
                result.value,
                result.label,
                result.description,
                result.warningMessage) : null);
    }

    getAll(): Promise<SettingQuery[]> {
        return this.connection.all(`
            select * from setting
            order by key asc
        `)
            .then((result: any) => result.map((r: any) => new Setting(
                r.key,
                r.value,
                r.label,
                r.description, 
                result.warningMessage)))
    }

    async getRouterOptions(): Promise<RouterOptions> {
        let networkId = await this.getString(SettingKey.networkId);
        return {
            password: await this.getString(SettingKey.routerAdminPassword),
            routerIp: Helpers.combineIpAddresses(networkId, "1"),
            fullNetwork: Helpers.combineIpAddresses(networkId, "0"),
            name: await this.getString(SettingKey.routerModel),
        }
    }

    async needsSetup(): Promise<boolean> {
        let networkId = await this.getString(SettingKey.networkId);
        let routerModel = await this.getString(SettingKey.routerModel);
        let password = await this.getString(SettingKey.routerAdminPassword);
        return networkId == "" || routerModel == ModelName.None || password == "";
    }

    async resetNetworkSettings(): Promise<void> {
        await this.set(SettingKey.networkId, "");
        await this.set(SettingKey.routerModel, ModelName.None);
        this.set(SettingKey.routerAdminPassword, "");
    }

    async getDhcpOptions() : Promise<IscDhcpOptions> {
        return {
            network: await this.getString(SettingKey.networkId),
            thisHost: await this.getString(SettingKey.thisHost),
            dhcpMaxHost: await this.getString(SettingKey.dhcpMaxHost),
            dhcpMinHost: await this.getString(SettingKey.dhcpMinHost),
        }
    }
}