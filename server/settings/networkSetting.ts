import { Helpers } from "../helpers"
import { IPAddress } from "../IPAddress";
import { SettingDb, SettingKey } from "./settingDb"


export class NetworkSetting {

    static getNetmask() {
        return "255.255.255.0";
    }

    static getPrefix() {
        return 24;
    }

    // e.g. 192.168.0.39
    static async getThisIp(): Promise<string> {
        return this.combineIpAddresses(await SettingDb.getString(SettingKey.networkId), await SettingDb.getString(SettingKey.thisHost));
    }

    // e.g. 192.168.0.0
    static async getFullNetwork(): Promise<string> {
        return this.combineIpAddresses(await SettingDb.getString(SettingKey.networkId), "0");
    }

    // e.g. 
    static async getFullNetworkAsHex(): Promise<string> {
        let ip = await this.getFullNetwork();
        return IPAddress.fromString(ip).toHex();
    }

    // e.g. 192.168.0.1
    static async getRouterIp(): Promise<string> {
        return this.combineIpAddresses(await SettingDb.getString(SettingKey.networkId), "1");
    }

    // e.g. 192.168.0.255
    static async getBroadcastIp(): Promise<string> {
        return this.combineIpAddresses(await SettingDb.getString(SettingKey.networkId), "255");
    }

    // e.g. 192.168.0.100
    static async getDhcpMin(): Promise<string> {
        return this.combineIpAddresses(await SettingDb.getString(SettingKey.networkId), await SettingDb.getString(SettingKey.dhcpMinHost));
    }

    // e.g. 192.168.0.200
    static async getDhcpMax(): Promise<string> {
        return this.combineIpAddresses(await SettingDb.getString(SettingKey.networkId), await SettingDb.getString(SettingKey.dhcpMaxHost));
    }

    static combineIpAddresses(a: string, b: string) {
        return Helpers.trim(a, ".") + "." + Helpers.trim(b, ".");
    }
} 