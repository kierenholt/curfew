import { NetPlan } from './netplan';
import { Helpers } from "../utility/helpers";
var dhcp = require('isc-dhcp-server');
var exec = require("child-process-promise").exec
import getMAC from 'getmac'

export class IscDhcp {
    static async updateSettingsAndRestart(
        dhcpMinHost: string, 
        dhcpMaxHost: string, 
        networkId: string, 
        thisHost: string,
    ): Promise<void> {
        let dhcpMinIp = Helpers.combineIpAddresses(networkId, dhcpMinHost);
        let dhcpMaxIp = Helpers.combineIpAddresses(networkId, dhcpMaxHost);
        let thisIp = Helpers.combineIpAddresses(networkId, thisHost);
        let network = Helpers.combineIpAddresses(networkId, "0");
        let routerIp = Helpers.combineIpAddresses(networkId, "1");
        let broadcastIp = Helpers.combineIpAddresses(networkId, "255");
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
            netmask: "255.255.255.0",
            router: routerIp,
            dns: [thisIp],
            broadcast: broadcastIp,
            on_commit: ``
        });
        
        if (await this.isRunning()) {
            await this.stop();
        }

        return s.start()
            .then(() => {
                console.log(". starting dhcp server on " + thisIp);
                return IscDhcp.isRunning;
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

    static start(): Promise<void> {
        return exec("systemctl start isc-dhcp-server");
    }

    static stop(): Promise<void> {
        return exec("systemctl stop isc-dhcp-server");
    }
}