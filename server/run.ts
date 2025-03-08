import { DnsServer } from "./dns/dnsServer";
import { API as API } from "./api";
import { RouterBase } from "./router/routerBase";
import * as dotenv from "dotenv";
import { Jobs } from "./jobs";
import { CurfewDb } from "./db";
import { checkSudo } from "./checkSudo";
import { VirginRouter as VirginRouter } from "./router/virgin/virginRouter";
import { SettingQuery } from "./settings/settingQuery";
import { NetworkSetting } from "./settings/networkSetting";
import { SettingKey } from "./settings/setting";

dotenv.config();

async function run() {
    checkSudo();
    let db = await CurfewDb.init();
    await Jobs.start(db);

    let password = await db.settingQuery.getString(SettingKey.routerAdminPassword);
    let routerIp = await db.networkSetting.getRouterIp();
    let fullNetworkAsHex = await db.networkSetting.getFullNetworkAsHex();
    let router: RouterBase = new VirginRouter(password, routerIp, fullNetworkAsHex);

    if (!await router.checkPassword()) {
        API.start(db); //cannot login - user needs to set password
    }
    else {
        
        if (Number(process.env.ROUTER_ENABLED)) {
            //CONFIGURE ROUTER
            await router.disableDHCP();
        
            //SET ROUTER FILTERS
            await router.applyBlockedIPsAndPorts(await db.getAllBlockedIPsAndPorts());
        }
        
        if (Number(process.env.DNS_ENABLED)) {
            //DNS SERVER
            await DnsServer.start(db);
        }
        
        //API
        API.start(db);
    }
}
run();

