import { DnsRequest } from "./db/dnsRequest";
import { Setting, SettingKey } from "./db/setting";

const cron = require('node-cron');

export class Jobs {

    //https://www.npmjs.com/package/node-cron
    
    static init() {
        //old request cleanup
        cron.schedule('0 0 * * *', async () => {
            let daysOld = await Setting.getNumber(SettingKey.requestExpiryDays);
            await DnsRequest.deleteOlderThanDays(daysOld);
        });
    }
}