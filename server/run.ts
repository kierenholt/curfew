import { DnsServer } from "./dns/dnsServer";
import { API } from "./api";
import { RouterBase } from "./router/routerBase";
import { CurfewDb } from "./db";
import { checkSudo } from "./utility/checkSudo";
import * as dotenv from "dotenv";
import { IscDhcp } from "./net/dhcp";
import { RouterProvider } from "./router/routerProvider";
import { Jobs } from "./utility/jobs";
import { Setup } from "./setup/setup";
import { checkEnv } from "./utility/checkEnv";
import { SettingKey } from "./settings/setting";

dotenv.config();

async function run() {
    checkSudo();
    checkEnv();
    
    let db = await CurfewDb.init();

    if (await db.settingQuery.needsSetup()) {
        await new Setup(db).init();
    }
    else {
        // NORMAL STARTUP
        let router: RouterBase | null = await new RouterProvider(await db.settingQuery.getRouterOptions())
            .savedRouter(await db.settingQuery.getString(SettingKey.routerModel));
            
        if (router == null || !(await router.isPasswordCorrect())) {
            throw("router not found or invalid password");
            // hardReset(db);
        }

        await Jobs.start(db);

        //CONFIGURE ROUTER
        await router!.disableDHCPIfEnabled();
        await IscDhcp.updateSettings(await db.settingQuery.getDhcpOptions());
    
        //SET ROUTER FILTERS
        await router!.applyBlockedIPsAndPorts(await db.getAllBlockedIPsAndPorts());
        
        if (Number(process.env.DNS_ENABLED)) {
            //DNS SERVER
            await DnsServer.start(db);
        }
        
        //API
        API.start(db);
    }
}
run();

