import { CurfewDb } from "../db";
import { SettingKey } from "../settings/setting";
import { RouterBase } from "./routerBase";
import { VirginRouter } from "./virgin/virginRouter";

export enum ModelName {
    VirginHub3 = "Virgin Hub 3",
    None = "None",
}

export class RouterProvider {
    db: CurfewDb;

    static networksToSearch = ["192.168.0", "192.168.1"];

    constructor(db: CurfewDb) {
        this.db = db;
    }

    async savedRouter(): Promise<RouterBase | null> {
        let name = await this.db.settingQuery.getString(SettingKey.activeRouterModel);
        if (name == ModelName.VirginHub3) {
            let password = await this.db.settingQuery.getString(SettingKey.routerAdminPassword);
            let routerIp = await this.db.networkSetting.getRouterIp();
            let fullNetworkAsHex = await this.db.networkSetting.getFullNetworkAsHex();
            return new VirginRouter(password, routerIp, fullNetworkAsHex);
        }
        return null;
    }

    async findRouterNetworkIdAndModel(): Promise<[string, string]> {
        for (let networkId of RouterProvider.networksToSearch) {
            let routerIp = networkId + ".1"; //may to adjust this device IP as well?
            let fullNetworkAsHex = "";
            let password = "";
            let virginRouter = new VirginRouter(password, fullNetworkAsHex, routerIp);
            if (await virginRouter.hasLoginPage()) {
                return [networkId, ModelName.VirginHub3];
            }
        }
        return ["", ModelName.None];
    }
    
    async findRouterAndSave() {
        console.log(". searching for router");
        let [networkId, foundModel] = await this.findRouterNetworkIdAndModel();
        if (foundModel == ModelName.None) {

            console.log("✓ could not find router");
        }
        else {
            
            await this.db.settingQuery.set(SettingKey.activeRouterModel, foundModel);
            await this.db.settingQuery.set(SettingKey.networkId, networkId);
            console.log("✓ success");
        }

        console.log(". checking password");
        let router = await this.savedRouter();
        let success = await router?.checkPassword();
        if (!success) {

            console.log("✓ password failed");
        }
        else {

            console.log("✓ success");
        }
    }
}