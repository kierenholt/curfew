import { Helpers } from '../utility/helpers';
import { NetPlan } from './netplan';
import * as fs from 'fs';

export interface IscDhcpOptions {
    dhcpMinHost: string, 
    dhcpMaxHost: string, 
    network: string,
    thisHost: string;
}

export class IscDhcp {
    static confFile = "/etc/dhcp/dhcpd.conf";
    static interfacesFile = "/etc/default/isc-dhcp-server";

    static async updateSettings(options: IscDhcpOptions): Promise<void> {

        if (!fs.existsSync(this.confFile)) {
            throw(`isc dhcp error: ${this.confFile} not found`);
        }
        if (!fs.existsSync(this.interfacesFile)) {
            throw(`isc dhcp error: ${this.interfacesFile} not found`);
        }

        let interfaceName = await NetPlan.getInterfaceName();
        this.writeConfiguration(options, 
            interfaceName,
            String(process.env.HOSTNAME));

        return this.isRunning()
            .then((result: boolean) => {
                if (result) {
                    return this.restart();
                }
                else {
                    return this.start();
                }
            });
    }

    //https://documentation.ubuntu.com/server/how-to/networking/install-isc-dhcp-server/index.html
    static writeConfiguration(obj: IscDhcpOptions, 
        interfaceName: string,
        hostname: string) {
        let confString = `
default-lease-time 600;
max-lease-time 7200;
    
subnet ${obj.network}.0 netmask 255.255.255.0 {
 range ${obj.network}.${obj.dhcpMinHost} ${obj.network}.${obj.dhcpMaxHost};
 option routers ${obj.network}.1;
 option domain-name-servers ${obj.network}.${obj.thisHost};
 option domain-name "${hostname}.local";
}
`;
        fs.writeFileSync(this.confFile, confString);

        let interfacesString = `
INTERFACESv4="${interfaceName}"
`;
        fs.writeFileSync(this.interfacesFile, interfacesString);
}

    static isRunning(): Promise<boolean> {
        return Helpers.execP("systemctl status isc-dhcp-server")
            .then((result: any) => {
                return result.indexOf('(running)') != -1;
            })
            .catch((err: any) => {
                return false;
            });
    }

    static restart(): Promise<void> {
        return Helpers.execP("systemctl restart isc-dhcp-server")
            .then(() => {
                console.log(". restarting dhcp server");
                return IscDhcp.isRunning();
            })
            .then((isRunning: boolean) => {
                if (isRunning) {
                    console.log("✓ success");
                    return;
                }
                else {
                    throw ("! error restarting dhcp server")
                }
            })
            .catch((e: any) => {
                throw ('! error restarting DHCP server: ' + e)
            });
    }

    static start(): Promise<void> {
        return Helpers.execP("systemctl start isc-dhcp-server")
            .then(() => {
                console.log(". starting dhcp server");
                return IscDhcp.isRunning();
            })
            .then((isRunning: boolean) => {
                if (isRunning) {
                    console.log("✓ success");
                    return;
                }
                else {
                    throw ("! error starting dhcp server")
                }
            })
            .catch((e: any) => {
                throw ('! error starting DHCP server: ' + e)
            });
    }

    static stop(): Promise<void> {
        return Helpers.execP("systemctl stop isc-dhcp-server")
        .then(() => {
            console.log(". stopping dhcp server");
            return IscDhcp.isRunning();
        })
        .then((isRunning: boolean) => {
            if (!isRunning) {
                console.log("✓ success");
                return;
            }
            else {
                throw ("! error stopping dhcp server")
            }
        })
        .catch((e: any) => {
            throw ('! error stopping DHCP server: ' + e)
        });
    }
}