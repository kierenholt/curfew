
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
    routerModel = 9, //string e.g. virgin hub 3
    dbVersion = 10, //string
}

export interface Setting {
    key: SettingKey;
    value: string;
    label: string;
    description: string;
    warningMessage: string;
}