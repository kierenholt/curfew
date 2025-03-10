import { Helpers } from "../utility/helpers";
var exec = require("child-process-promise").exec

const Netplan1 = require('netplan-config');
// https://www.npmjs.com/package/netplan-config

export class NetPlan {
    static async enableDhcp(): Promise<void> {
        const net = new Netplan1();
        let options = {
            dhcp: true
        };
        if (process.env.WIFI == "1") {
            this.addWifiSettings(options);
        }
        net.configureInterface(this.getInterfaceName(), options);

        console.log(`. netplan - enabling dhcp`);
        net.writeConfig();

        return net.apply()
            .then((result: any) => {
                if (result.code == 0) {
                    console.log("✓ success");
                    return;
                }
                throw ("error trying to set netplan dhcp on");
            });
    }

    static addWifiSettings(obj: any) {
        if (process.env.WIFI_SSID == "") {
            throw new Error("wifi ssid cannot be blank");
        }
        obj["accessPoint"] = {
            ssid: process.env.WIFI_SSID,
            wifiPassword: process.env.WIFI_PASSWORD
        };
    }

    static async disableDhcpsetStaticIp(networkId: string, 
        thisHost: string, 
        DnsUpstreamIp: string
    ): Promise<void> {
        if (networkId == "") {
            throw new Error("setting static IP but network id cannot be null");
        }
        if (thisHost == "") {
            throw new Error("setting static IP but host cannot be null");
        }
        if (DnsUpstreamIp == "") {
            throw new Error("setting static IP but upstream dns cannot be null");
        }
        const thisIp = Helpers.combineIpAddresses(networkId, thisHost);
        let routerIp = Helpers.combineIpAddresses(networkId, "1");
        
        // Configure eth0 as a static WAN interface
        const net = new Netplan1();
        let options = {
            dhcp: false,
            ip: thisIp,
            defaultGateway: routerIp,
            nameservers: [DnsUpstreamIp],
            domain: `${process.env.HOSTNAME}.local`,
            prefix: 24,
        };
        if (process.env.WIFI == "1") {
            this.addWifiSettings(options);
        }
        net.configureInterface(this.getInterfaceName(), options);

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
        if (process.env.WIFI == "1") {
            for (let prop in net.plan.network.wifis) { 
                if (prop) {
                    return prop;
                } 
            };
        }
        else {
            for (let prop in net.plan.network.ethernets) { 
                if (prop) {
                    return prop;
                } 
            };
        }
        throw("interface not found");
    }

    static getNetworkId(): Promise<string> {
        return exec("ip route show")
            .then((result: any) => {
                let matches = new RegExp(/default via ([0-9]*\.[0-9]*\.[0-9]*)/).exec(result.stdout);
                if (matches == null) {
                    throw new Error("error occured while trying to get netowrk id");
                }
                return matches[1];
            })
            .catch((err: any) => {
                throw new Error("error occured while trying to get netowrk id");
            });
    }
}