import { DnsServer } from "./dns/dnsServer";
import { API as API } from "./api";
import { Router } from "./router/router";
import * as dotenv from "dotenv";
import { Jobs } from "./jobs";
import { Db } from "./db";

dotenv.config();

async function run() {
    await Db.init();
    
    //API
    if (Number(process.env.API_ENABLED)) {
        API.init();
    }

    //INITIALISE
    await Router.init();

    //DNS SERVER
    if (Number(process.env.DNS_ENABLED)) {
        await DnsServer.init();
    }
    
    //MDNS SERVER
    // if (Number(process.env.MDNS_ENABLED)) {
    //     MDnsServer.init();
    // }

    Jobs.init();
}
run();
