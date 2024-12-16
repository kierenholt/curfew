import { DnsServer } from "./dns/dnsServer";
import { API as API } from "./api";
import { Router } from "./router/router";
import * as dotenv from "dotenv";
import { Jobs } from "./jobs";
import { Db } from "./db";
import { checkSudo } from "./checkSudo";
import { KeywordDb } from "./keyword/keywordDb";

dotenv.config({ path: (process.env.TEST ? '.test.env' : '.env') });
if (process.env.TEST) console.log("test mode enabled");

async function run() {
    checkSudo();
    await Db.init();
    await Jobs.init();

    KeywordDb.setIsActive(1, 1); //youtube
    KeywordDb.setIsActive(2, 1); //brawlstars
    KeywordDb.setIsActive(3, 0); //tiktok

    //API
    if (Number(process.env.API_ENABLED)) {
        API.init();
    }

    //INITIALISE NETWORK
    await Router.setupDHCP();

    //DNS SERVER
    if (Number(process.env.DNS_ENABLED)) {
        await DnsServer.init();
    }

    //MDNS SERVER
    // if (Number(process.env.MDNS_ENABLED)) {
    //     MDnsServer.init();
    // }

}
run();
