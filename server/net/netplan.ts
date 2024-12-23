import { SettingDb, SettingKey } from "../settings/settingDb";
import { NetInfo } from "./netInfo";

const Netplan = require('netplan-config');

export class NetPlan {
    static async updateIp(): Promise<void> {
        const ip: string = await SettingDb.getString(SettingKey.lanIp);
        const [name, protocol] = NetInfo.getNameAndProtocol();
        const net = new Netplan();

        // Configure eth0 as a static WAN interface
        net.configureInterface(name, {
            ip: ip,
            defaultGateway: '192.168.0.1',
            nameservers: [process.env.DNS_UPSTREAM],
            domain: `${process.env.HOSTNAME}.local`,
            prefix: 24,
        });

        console.log(`. setting ip address`);
        net.writeConfig();

        return net.apply()
            .then((result: any) => {
                if (result.code == 0) {
                    console.log("✓ success");
                    return;
                }
                throw ("error trying to set ip address to " + ip);
            });
    }
}