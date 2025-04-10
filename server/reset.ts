import { CurfewDb } from "./db";
import { IscDhcp } from "./net/dhcp";
import { RouterBase } from "./router/routerBase";
import { ModelName, RouterProvider } from "./router/routerProvider";
import { SettingKey } from "./settings/types";

export async function hardReset(db: CurfewDb) {
    //ATTEMPT TO RE-ENABLE DHCP ON ROUTER AND STOP ISC DHCP
    let router: RouterBase | null = await new RouterProvider(await db.settingQuery.getRouterOptions())
        .savedRouter(await db.settingQuery.getString(SettingKey.routerModel));
    if (router != null) {
        try {
            await router.deleteAllFilters();
            await router.setDHCPEnabled(true);
            await IscDhcp.stop();
        }
        catch {}
    }

    //WIPE NETWORK SETTINGS
    await db.settingQuery.set(SettingKey.networkId, "");    
    await db.settingQuery.set(SettingKey.routerModel, ModelName.None);
    await db.settingQuery.set(SettingKey.routerAdminPassword, "");
    process.exit();
}

export async function shutdown(db: CurfewDb) {
    let router: RouterBase | null = await new RouterProvider(await db.settingQuery.getRouterOptions())
        .savedRouter(await db.settingQuery.getString(SettingKey.routerModel));
    if (router != null) {
        try {
            await router.deleteAllFilters();
            await router.setDHCPEnabled(true);
            await IscDhcp.stop();
        }
        catch {}
    }
    process.exit();
}