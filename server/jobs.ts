import { DnsResponseDb } from "./dnsResponse/dnsResponseDb";
const cron = require('node-cron');


export class Jobs {

    //https://www.npmjs.com/package/node-cron
    //https://crontab.guru/examples.html

    static async start() {
        await DnsResponseDb.deleteOlderThan1Hour();

        cron.schedule('0 * * * *', async () => { //every hour
            DnsResponseDb.deleteOlderThan1Hour();
        });
    }
}