import { DnsServer } from "./dns/dnsServer";
import { API as API } from "./api";
import { Router } from "./router/router";
import * as dotenv from "dotenv";
import { Jobs } from "./jobs";
import { Db } from "./db";
import { checkSudo } from "./checkSudo";

dotenv.config();

async function run() {
    checkSudo();
    await Db.start();
    await Jobs.start();

    await Router.detect();
    //router is not found

    if (!await Router.checkPassword()) {
        API.start(); //cannot login - user needs to set password
    }
    else {
        //CONFIGURE ROUTER
        await Router.disableDHCP();
    
        //SET ROUTER FILTERS
        await Router.resetFilters();
    
        //DNS SERVER
        await DnsServer.start();
        
        //API
        API.start();
    }
}
run();

