
// must be copied over to app
export enum SettingKey {
    routerAdminPassword = 1,
    thisHost = 2,
    pin = 3,
    inactivityLockSecs = 4,
    networkId = 5, //first three octet
    dhcpMinHost = 6, //one octet
    dhcpMaxHost = 7, //one octet
    upstreamDnsServer = 8
}


export interface ISetting {
    key: SettingKey;
    value: string;
    label: string;
    description: string;
    warningMessage: string;
}