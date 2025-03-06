import { DnsResponseQuery } from "./dnsResponse/dnsResponseDb";
const cron = require('node-cron');


export class Jobs {

    //https://www.npmjs.com/package/node-cron
    //https://crontab.guru/examples.html

    static async start() {
        await DnsResponseQuery.deleteOlderThan1Hour();

        cron.schedule('0 * * * *', async () => { //every hour
            DnsResponseQuery.deleteOlderThan1Hour();
        });
    }
}