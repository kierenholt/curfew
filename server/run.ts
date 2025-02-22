import { DnsServer } from "./dns/dnsServer";
import { API as API } from "./api";
import { Router } from "./router/router";
import * as dotenv from "dotenv";
import { Jobs } from "./jobs";
import { Db } from "./db";
import { checkSudo } from "./checkSudo";
import { Dhcp } from "./net/dhcp";
import { NetPlan } from "./net/netplan";
import { KeywordDb } from "./keyword/keywordDb";

dotenv.config({ path: (Number(process.env.TEST) ? '.test.env' : '.env') });
if (Number(process.env.TEST)) console.log("test mode enabled");

// let sillyFetch = async (): Promise<any> => {
//     console.log("try fetch");
//     return fetch("https://www.nothing.com")
//         .catch((err) => { 
//             console.log("retrying");
//             sillyFetch();
//         });
// }
// sillyFetch();


async function run() {
    checkSudo();
    await Db.start();
    await Jobs.start();

    await Router.detect();
    if (!await Router.checkPassword()) {
        API.start(); //user needs to set password
    }

    //API
    if (Number(process.env.API_ENABLED)) {
        API.start();
    }

    //SET IP
    await NetPlan.updateIp();

    //START DHCP
    if (Number(process.env.DHCP_ENABLED)) {
        await Router.disableDHCP();
        await Dhcp.restartOrStart();
    }

    //SET ROUTER FILTERS
    await Router.resetFilters();

    //DNS SERVER
    if (Number(process.env.DNS_ENABLED)) {
        await DnsServer.start();
    }

    //MDNS SERVER
    // if (Number(process.env.MDNS_ENABLED)) {
    //     MDnsServer.init();
    // }

}
run();

