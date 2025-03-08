import { Helpers } from "../helpers";

const Netplan1 = require('netplan-config');
// https://www.npmjs.com/package/netplan-config

export class NetPlan {
    static async enableDhcp() {
        const net = new Netplan1();
        net.configureInterface(this.getInterfaceName(), {
            dhcp: true
        });

        console.log(`. netplan - enabling dhcp`);
        net.writeConfig();

        return net.apply()
            .then((result: any) => {
                if (result.code == 0) {
                    console.log("✓ success");
                    return;
                }
                throw ("error trying to set dhcp on");
            });
    }

    static async disableDhcpsetStaticIp(networkId: string, thisHost: string, DnsUpstreamIp: string): Promise<void> {
        if (networkId == "") {
            throw new Error("disabling DHCP but network id cannot be null");
        }
        if (thisHost == "") {
            throw new Error("disabling DHCP but host cannot be null");
        }
        if (DnsUpstreamIp == "") {
            throw new Error("disabling DHCP but upstream dns cannot be null");
        }
        const thisIp = Helpers.combineIpAddresses(networkId, thisHost);
        let routerIp = Helpers.combineIpAddresses(networkId, "1");
        
        // Configure eth0 as a static WAN interface
        const net = new Netplan1();
        net.configureInterface(this.getInterfaceName(), {
            dhcp: false,
            ip: thisIp,
            defaultGateway: routerIp,
            nameservers: [DnsUpstreamIp],
            domain: `${process.env.HOSTNAME}.local`,
            prefix: 24,
        });

        console.log(`. netplan - setting static ip address`);
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