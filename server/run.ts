import { DnsServer } from "./dns/dnsServer";
import { API as API } from "./api";
import { Router } from "./router/router";
import * as dotenv from "dotenv";
import { Jobs } from "./jobs";
import { Db } from "./db";
import { checkSudo } from "./checkSudo";
import { Dhcp } from "./net/dhcp";
import { SettingDb, SettingKey } from "./settings/settingDb";
import { NetPlan } from "./net/netplan";

dotenv.config({ path: (process.env.TEST ? '.test.env' : '.env') });
if (process.env.TEST) console.log("test mode enabled");

async function run() {
    checkSudo();
    await Db.start();
    await Jobs.start();

    //API
    if (Number(process.env.API_ENABLED)) {
        API.start();
    }

    //SET IP
    await NetPlan.updateIp();

    //START DHCP
    await Dhcp.restartOrStart();

    //SET ROUTER FILTERS
    await Router.init();

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
