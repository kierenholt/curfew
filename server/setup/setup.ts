import { API } from "../api";
import { CurfewDb } from "../db";
import { IscDhcp } from "../net/dhcp";
import { NetPlan } from "../net/netplan";
import { ModelName, RouterOptions, RouterProvider } from "../router/routerProvider";
import { SettingKey } from "../settings/setting";
import { Helpers } from "../utility/helpers";


export class Setup {
    password: string = "";
    networkId: string = "";
    routerModel: string = ModelName.None;
    
    db: CurfewDb;
    constructor(db : CurfewDb) {
        this.db = db;
    }
    
    async init() {
        //SETUP
        this.networkId = await NetPlan.getNetworkId();
        console.log(". stopping ISC DHCP");
        await IscDhcp.stop();
    
        // 	netplan set dhcp on
        console.log(". finding network id");
        await NetPlan.enableDhcp();
        await Helpers.wait(2000);

        // 	find and save the network id
        this.networkId = await NetPlan.getNetworkId();
        if (this.networkId == "") {
            throw("error getting network id");
        }
        console.log("✓ success");
        
        // 	netplan set static ip to 39
        console.log(". setting static IP address");
        let thisHost = await this.db.settingQuery.getString(SettingKey.thisHost);
        let dnsUpstreamIp = await this.db.settingQuery.getString(SettingKey.upstreamDnsServer);
        await NetPlan.disableDhcpsetStaticIp(this.networkId, thisHost, dnsUpstreamIp);
        await Helpers.wait(2000);
        
        // find router model
        console.log(". identifying router ");
        this.routerModel = await new RouterProvider(this.options).identifyRouter();
        if (this.routerModel == ModelName.None) {
            throw("no router found"); //SHOW ERROR IN API
        }
        console.log("✓ success");
        
        // HAS STATIC IP AT THIS POINT - API CAN BE LOADED
        API.start(this.db, this);

        // asks for password
        // user enters password
        // api tests password
        // api saves password
        // api resets
    }    

    async save(): Promise<void> {
        if (this.networkId == "" || this.password == "" || this.routerModel == ModelName.None) {
            throw("cannot save setup if some settings are empty");
        }
        await this.db.settingQuery.set(SettingKey.networkId, this.networkId);
        await this.db.settingQuery.set(SettingKey.routerAdminPassword, this.password);
        await this.db.settingQuery.set(SettingKey.routerModel, this.routerModel);
    }

    get options(): RouterOptions {
        return {
            password: this.password,
            routerIp: Helpers.combineIpAddresses(this.networkId, "1"),
            fullNetwork: Helpers.combineIpAddresses(this.networkId, "0"),
            name: this.routerModel,
        }
    }
}