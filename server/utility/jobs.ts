import { CurfewDb } from "../db";
const cron = require('node-cron');


export class Jobs {

    //https://www.npmjs.com/package/node-cron
    //https://crontab.guru/examples.html

    static async start(db: CurfewDb) {
        await db.dnsResponseQuery.deleteOlderThan1Hour();

        cron.schedule('0 * * * *', async () => { //every hour
            db.dnsResponseQuery.deleteOlderThan1Hour();
        });
    }
}