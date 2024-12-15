import { DnsResponseDb } from "./dns/dnsResponseDb";
const cron = require('node-cron');


export class Jobs {

    //https://www.npmjs.com/package/node-cron
    //https://crontab.guru/examples.html

    static async init() {
        await DnsResponseDb.deleteOlderThan1Day();

        cron.schedule('0 * * * *', async () => { //every hour
            DnsResponseDb.deleteOlderThan1Day();
        });
    }
}