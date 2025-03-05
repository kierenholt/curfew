import { DnsServer } from "./dns/dnsServer";
import { API as API } from "./api";
import { RouterManager } from "./router/routerManager";
import * as dotenv from "dotenv";
import { Jobs } from "./jobs";
import { Db } from "./db";
import { checkSudo } from "./checkSudo";

dotenv.config();

async function run() {
    checkSudo();
    await Db.start();
    await Jobs.start();

    await RouterManager.detect();
    //router is not found

    if (!await RouterManager.checkPassword()) {
        API.start(); //cannot login - user needs to set password
    }
    else {
        
        if (Number(process.env.ROUTER_ENABLED)) {
            //CONFIGURE ROUTER
            await RouterManager.disableDHCP();
        
            //SET ROUTER FILTERS
            await RouterManager.resetFilters();
        }
        
        if (Number(process.env.DNS_ENABLED)) {
            //DNS SERVER
            await DnsServer.start();
        }
        
        //API
        API.start();
    }
}
run();

