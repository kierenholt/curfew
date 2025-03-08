import { CurfewDb } from "../db";
import { SettingKey } from "../settings/setting";

const Netplan1 = require('netplan-config');

export class NetPlan {
    static async update(db: CurfewDb): Promise<void> {
        const thisIp = await db.networkSetting.getThisIp();
        let routerIp = await db.networkSetting.getRouterIp();
        let dnsUpstream = await db.settingQuery.getString(SettingKey.upstreamDnsServer);
        
        // Configure eth0 as a static WAN interface
        const net = new Netplan1();
        net.configureInterface(this.getInterfaceName(), {
            ip: thisIp,
            defaultGateway: routerIp,
            nameservers: [dnsUpstream],
            domain: `${process.env.HOSTNAME}.local`,
            prefix: db.networkSetting.getPrefix(),
        });

        console.log(`. setting ip address`);
        net.writeConfig();

        return net.apply()
            .then((result: any) => {
                if (result.code == 0) {
                    console.log("✓ success");
                    return;
                }
                throw ("error trying to set ip address to " + thisIp);
            });
    }

    static getInterfaceName(): string {
        const net = new Netplan1();
        net.loadConfig();
        let key = "";
        for (let prop in net.plan.network.wifis) { 
            if (prop) {
                return prop;
            } 
        };
        for (let prop in net.plan.network.ethernets) { 
            if (prop) {
                return prop;
            } 
        };
        throw("interface not found");
    }
}