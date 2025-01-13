import { NetworkSetting } from "../settings/networkSetting";
import { SettingDb, SettingKey } from "../settings/settingDb";
import { NetInfo } from "./netInfo";

const Netplan = require('netplan-config');

export class NetPlan {
    static async updateIp(): Promise<void> {
        const netInfo = new NetInfo();
        const thisIp = await NetworkSetting.getThisIp();
        let routerIp = await NetworkSetting.getRouterIp();
        let dnsUpstream = await SettingDb.getString(SettingKey.upstreamDnsServer);
        
        // Configure eth0 as a static WAN interface
        const net = new Netplan();
        net.configureInterface(netInfo.name, {
            ip: thisIp,
            defaultGateway: routerIp,
            nameservers: [dnsUpstream],
            domain: `${process.env.HOSTNAME}.local`,
            prefix: NetworkSetting.getPrefix(),
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
}