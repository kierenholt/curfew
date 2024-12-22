import { SettingDb, SettingKey } from '../settings/settingDb';
import { NetInfo } from './netInfo';
var dhcp = require('isc-dhcp-server');
var exec = require("child-process-promise").exec

export class Dhcp {

    static async init(): Promise<void> {
        const ip = await SettingDb.getString(SettingKey.lanIp);
        const [name, protocol] = NetInfo.getNameAndProtocol();
        if (name) {
            var s = dhcp.createServer({
                interface: name,
                range: [
                    "192.168.0.100", "192.168.0.200"
                ],
                static: [
                    {
                        hostname: process.env.HOSTNAME,
                        mac_address: protocol.mac,
                        ip_address: ip
                    }
                ],
                network: '192.168.0.0',
                netmask: protocol.netmask,
                router: '192.168.0.1',
                dns: [ip],
                broadcast: '192.168.0.255',
                on_commit: ``
            });

            return s.start()
                .then(() => {
                    console.log(". starting dhcp server on " + ip);
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
        throw ("! unable find available network adapter");
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

    static restart(): Promise<void> {
        return this.stop()
            .then(this.init);
    }

    static stop(): Promise<void> {
        return exec("systemctl stop isc-dhcp-server");
    }
}