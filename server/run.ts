import { DnsServer } from "./dns/dnsServer";
import { API } from "./api";
import { RouterBase } from "./router/routerBase";
import { CurfewDb } from "./db";
import { checkSudo } from "./utility/checkSudo";
import { SettingKey } from "./settings/setting";
import * as dotenv from "dotenv";
import { IscDhcp } from "./net/dhcp";
import { NetPlan } from "./net/netplan";
import { ModelName, RouterProvider } from "./router/routerProvider";
import { Jobs } from "./utility/jobs";
import { Setup } from "./setup/setup";
import { hardReset } from "./reset";

dotenv.config();

async function run() {
    checkSudo();
    
    let db = await CurfewDb.init();
    await db.settingQuery.set(SettingKey.routerModel, ModelName.None);

    if (await db.settingQuery.needsSetup()) {
        await new Setup(db).init();
    }
    else {
        // NORMAL STARTUP
        
        let router: RouterBase | null = await new RouterProvider(await db.settingQuery.getRouterOptions()).savedRouter();
        if (router == null || !(await router.isPasswordCorrect())) {
            throw("router not found or invalid password");
            // hardReset(db);
        }

        await Jobs.start(db);

        if (Number(process.env.ROUTER_ENABLED)) {
            //CONFIGURE ROUTER
            await router!.disableDHCP();
            await IscDhcp.start();
        
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
run();

