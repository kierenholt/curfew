import { Helpers } from "../helpers"
import { IPAddress } from "../router/IPAddress";
import { SettingKey } from "./setting";
import { SettingQuery } from "./settingQuery"


export class NetworkSetting {
    settingQuery: SettingQuery;

    constructor(settingQuery: SettingQuery) {
        this.settingQuery = settingQuery;
    }

    getNetmask() {
        return "255.255.255.0";
    }

    getPrefix() {
        return 24;
    }

    // e.g. 192.168.0.39
    async getThisIp(): Promise<string> {
        return this.combineIpAddresses(await this.settingQuery.getString(SettingKey.networkId), await this.settingQuery.getString(SettingKey.thisHost));
    }

    // e.g. 192.168.0.0
    async getFullNetwork(): Promise<string> {
        return this.combineIpAddresses(await this.settingQuery.getString(SettingKey.networkId), "0");
    }

    // e.g.
    async getFullNetworkAsHex(): Promise<string> {
        let ip = await this.getFullNetwork();
        return IPAddress.fromString(ip).toHex();
    }

    // e.g. 192.168.0.1
    async getRouterIp(): Promise<string> {
        return this.combineIpAddresses(await this.settingQuery.getString(SettingKey.networkId), "1");
    }

    // e.g. 192.168.0.255
    async getBroadcastIp(): Promise<string> {
        return this.combineIpAddresses(await this.settingQuery.getString(SettingKey.networkId), "255");
    }

    // e.g. 192.168.0.100
    async getDhcpMin(): Promise<string> {
        return this.combineIpAddresses(await this.settingQuery.getString(SettingKey.networkId), await this.settingQuery.getString(SettingKey.dhcpMinHost));
    }

    // e.g. 192.168.0.200
    async getDhcpMax(): Promise<string> {
        return this.combineIpAddresses(await this.settingQuery.getString(SettingKey.networkId), await this.settingQuery.getString(SettingKey.dhcpMaxHost));
    }

    combineIpAddresses(a: string, b: string) {
        return Helpers.trim(a, ".") + "." + Helpers.trim(b, ".");
    }
} 