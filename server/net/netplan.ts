var exec = require("child-process-promise").exec
import * as fs from 'fs';

export interface NetPlanOptions {
    network: string,
    thisHost: string,
    dns: string,
}

export class NetPlan {
    static confFile = "/etc/netplan/config.yaml";

    static async setDhcp(): Promise<void> {
        console.log(`. netplan - switching to dhcp`);
        let interfaceName = await this.getInterfaceName();
        if (process.env.WIFI == "1") {
            let ssid = process.env.WIFI_SSID;
            if (ssid == undefined) throw new Error("wifi ssid not set");
            let password = process.env.WIFI_PASSWORD
            if (password == undefined) throw new Error("wifi password not set");
            await this.writeConfiguration_wifi_DHCP(interfaceName,
                ssid,
                password);
        }
        else {
            await this.writeConfiguration_eth_DHCP(interfaceName);
        }

        return this.apply()
    }

    static async setStaticIp(options: NetPlanOptions): Promise<void> {
        if (options.network == "") {
            throw new Error("setting static IP but network cannot be null");
        }
        if (options.thisHost == "") {
            throw new Error("setting static IP but host cannot be null");
        }
        if (options.dns == "") {
            throw new Error("setting static IP but upstream dns cannot be null");
        }
        let interfaceName = await this.getInterfaceName();
        if (process.env.WIFI == "1") {
            let ssid = process.env.WIFI_SSID;
            if (ssid == undefined) throw new Error("wifi ssid not set");
            let password = process.env.WIFI_PASSWORD
            if (password == undefined) throw new Error("wifi password not set");
            await this.writeConfiguration_wifi_static(interfaceName,
                options, 
                ssid,
                password);
        }
        else {
            await this.writeConfiguration_eth_static(interfaceName, options);
        }

        return this.apply()
    }

    static apply(): Promise<void> {
        return exec("netplan apply")
            // .then((result: any) => {
                // if (result.code == 0) { IGNORE NETPLAN WARNINGS
                //     console.log("✓ success");
                //     return;
                // }
                // throw ("! error applying netplan");
            // })
            .catch((e: any) => {
                throw ('! error applying netplan: ' + e)
            });
    }

    static getInterfaceName(): Promise<string> {
        return (process.env.WIFI == "1") ? this.getInterface_wifi() : this.getInterface_eth();
    }

    //https://people.ubuntu.com/~slyon/netplan-docs/examples/
    static writeConfiguration_eth_DHCP(interfaceName: string) {
        let confString = `network:
  version: 2
  renderer: networkd
  ethernets:
    ${interfaceName}:
      dhcp4: true
`;
        fs.writeFileSync(this.confFile, confString);
    }

    //https://people.ubuntu.com/~slyon/netplan-docs/examples/
    static writeConfiguration_eth_static(
        interfaceName: string,
        options: NetPlanOptions) {
        let confString = `network:
  version: 2
  renderer: networkd
  wifis:
    ${interfaceName}:
      addresses:
        - ${options.network}.${options.thisHost}/24
      nameservers:
        addresses:
          - ${options.dns}
      routes:
        - to: 0.0.0.0/0
          via: ${options.network}.1
`;
        fs.writeFileSync(this.confFile, confString);
    }

    //https://people.ubuntu.com/~slyon/netplan-docs/examples/
    static writeConfiguration_wifi_DHCP(
        interfaceName: string,
        ssid: string,
        password: string) {
        let confString = `network:
  version: 2
  renderer: networkd
  wifis:
    ${interfaceName}:
      dhcp4: true
      access-points:
        ${ssid}:
          password: ${password}
`;
        fs.writeFileSync(this.confFile, confString);
    }

    //https://people.ubuntu.com/~slyon/netplan-docs/examples/
    static writeConfiguration_wifi_static(
        interfaceName: string,
        options: NetPlanOptions,
        ssid: string,
        password: string) {
        let confString = `network:
  version: 2
  renderer: networkd
  wifis:
    ${interfaceName}:
      addresses:
        - ${options.network}.${options.thisHost}/24
      nameservers:
        addresses:
          - ${options.dns}
      routes:
        - to: 0.0.0.0/0
          via: ${options.network}.1
      access-points:
        ${ssid}:
          password: ${password}
`
        fs.writeFileSync(this.confFile, confString);
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

    static getInterface_eth(): Promise<string> {
        return exec("ls /sys/class/net")
            .then((result: any) => {
                let matches = new RegExp(/(?:^|\s)(e\S+)/).exec(result.stdout);
                if (matches == null) {
                    throw new Error("error occured while trying to get eth interface");
                }
                return matches[1];
            })
            .catch((err: any) => {
                throw new Error("error occured while trying to get eth interface");
            });
    }

    static getInterface_wifi(): Promise<string> {
        return exec("ls /sys/class/net")
            .then((result: any) => {
                let matches = new RegExp(/(?:^|\s)(w\S+)/).exec(result.stdout);
                if (matches == null) {
                    throw new Error("error occured while trying to get wifi interface");
                }
                return matches[1];
            })
            .catch((err: any) => {
                throw new Error("error occured while trying to get wifi interface");
            });
    }
}