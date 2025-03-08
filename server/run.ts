import { DnsServer } from "./dns/dnsServer";
import { API as API } from "./api";
import { RouterBase } from "./router/routerBase";
import { Jobs } from "./jobs";
import { CurfewDb } from "./db";
import { checkSudo } from "./checkSudo";
import { VirginRouter as VirginRouter } from "./router/virgin/virginRouter";
import { SettingKey } from "./settings/setting";
import * as dotenv from "dotenv";
import { IscDhcp } from "./net/dhcp";
import { NetPlan } from "./net/netplan";
import { RouterProvider } from "./router/routerProvider";

dotenv.config();

async function run() {
    checkSudo();

    //first run
    let i = NetPlan.enableDhcp();

    if (false) {
        let db = await CurfewDb.init();
        await Jobs.start(db);
    
        let password = await db.settingQuery.getString(SettingKey.routerAdminPassword);
        let router: RouterBase | null = await new RouterProvider(db).savedRouter();
    
        if (router == null) {

        }
        else {

            if (!await router!.checkPassword()) {
                API.start(db); //cannot login - user needs to set password
            }
            else {
                
                if (Number(process.env.ROUTER_ENABLED)) {
                    //CONFIGURE ROUTER
                    await router!.disableDHCP();
                
                    //SET ROUTER FILTERS
                    await router!.applyBlockedIPsAndPorts(await db.getAllBlockedIPsAndPorts());
                }
                
                if (Number(process.env.DNS_ENABLED)) {
                    //DNS SERVER
                    await DnsServer.start(db);
                }
                
                //API
                API.start(db);
            }
        }
    }

}
run();

