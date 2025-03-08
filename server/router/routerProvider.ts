import { CurfewDb } from "../db";
import { Helpers } from "../helpers";
import { SettingKey } from "../settings/setting";
import { IPAddress } from "./IPAddress";
import { RouterBase } from "./routerBase";
import { VirginRouter } from "./virgin/virginRouter";

export enum ModelName {
    VirginHub3 = "Virgin Hub 3",
    None = "None",
}

export class RouterProvider {
    db: CurfewDb;

    constructor(db: CurfewDb) {
        this.db = db;
    }

    async savedRouter(): Promise<RouterBase | null> {
        let name = await this.db.settingQuery.getString(SettingKey.routerModel);
        if (name == ModelName.VirginHub3) {
            let password = await this.db.settingQuery.getString(SettingKey.routerAdminPassword);
            let networkId = await this.db.settingQuery.getString(SettingKey.networkId);
            let routerIp = Helpers.combineIpAddresses(networkId, "1");
            let fullNetwork = Helpers.combineIpAddresses(networkId, "0");
            let fullNetworkAsHex = IPAddress.fromString(fullNetwork).toHex();
            return new VirginRouter(password, routerIp, fullNetworkAsHex);
        }
        return null;
    }

    async findAndSaveRouterModel(): Promise<string> {
        let routerIp = this.db.settingQuery.getString(SettingKey.networkId) + ".1";
        let fullNetworkAsHex = "";
        let password = "";
        let virginRouter = new VirginRouter(password, fullNetworkAsHex, routerIp);
        if (await virginRouter.hasLoginPage()) {
            await this.db.settingQuery.set(SettingKey.routerModel, ModelName.VirginHub3);
            return ModelName.VirginHub3;
        }
        await this.db.settingQuery.set(SettingKey.routerModel, ModelName.None);
        return ModelName.None;
    }
}