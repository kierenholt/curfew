
// must be copied over to app
export enum SettingKey {
    routerAdminPassword = 1,
    lanIp = 2,
    pin = 3,
    inactivityLockSecs = 4,

}


export interface ISetting {
    key: SettingKey;
    value: string;
    label: string;
    description: string;
    warningMessage: string;
}