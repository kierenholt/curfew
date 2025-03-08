
// must be copied over to app
export enum SettingKey {
    routerAdminPassword = 1,
    thisHost = 2,
    pin = 3,
    inactivityLockSecs = 4,
    networkId = 5, //first three octets
    dhcpMinHost = 6, //last octet
    dhcpMaxHost = 7, //last octet
    upstreamDnsServer = 8,
    activeRouterModel = 9, //string e.g. virgin hub 3
}

export class Setting {

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
}