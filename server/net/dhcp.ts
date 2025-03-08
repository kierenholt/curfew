import { CurfewDb } from '../db';
import { NetPlan } from './netplan';
var dhcp = require('isc-dhcp-server');
var exec = require("child-process-promise").exec
import getMAC, { isMAC } from 'getmac'

export class Dhcp {
    static async update(db: CurfewDb): Promise<void> {
        if (await this.isRunning()) {
            await this.stop();
        }

        let dhcpMinIp = await db.networkSetting.getDhcpMin();
        let dhcpMaxIp = await db.networkSetting.getDhcpMax();
        let thisIp = await db.networkSetting.getThisIp();
        let network = await db.networkSetting.getFullNetwork();
        let routerIp = await db.networkSetting.getRouterIp();
        let broadcastIp = await db.networkSetting.getBroadcastIp();
        let interfaceName = NetPlan.getInterfaceName();
        let mac = getMAC(interfaceName);

        var s = dhcp.createServer({
            interface: interfaceName,
            range: [
                dhcpMinIp, dhcpMaxIp
            ],
            static: [
                {
                    hostname: process.env.HOSTNAME,
                    mac_address: mac,
                    ip_address: thisIp
                }
            ],
            network: network,
            netmask: db.networkSetting.getNetmask(),
            router: routerIp,
            dns: [thisIp],
            broadcast: broadcastIp,
            on_commit: ``
        });

        return s.start()
            .then(() => {
                console.log(". starting dhcp server on " + thisIp);
                return Dhcp.isRunning;
            })
            .then((success: boolean) => {
                if (success) {
                    console.log("✓ success");
                    return;
                }
                else {
                    throw ("! error starting dhcp server")
                }
            })
            .catch((e: any) => {
                throw ('! error starting DHCP server: ' + e)
            })
    }

    static isRunning(): Promise<boolean> {
        return exec("systemctl status isc-dhcp-server")
            .then((result: any) => {
                return result.stdout.indexOf('(running)') != -1;
            })
            .catch((err: any) => {
                return false;
            });
    }

    static stop(): Promise<void> {
        return exec("systemctl stop isc-dhcp-server");
    }
}