import { SettingDb, SettingKey } from "./settings/settingDb";

const cron = require('node-cron');

export class Jobs {

    //https://www.npmjs.com/package/node-cron

    static init() {
        //old request cleanup
        // cron.schedule('0 1 * * *', async () => {
        //     let daysOld = await Setting.getNumber(SettingKey.requestExpiryDays);
        //     await DnsRequest.deleteOlderThanDays(daysOld);
        // });
    }
}