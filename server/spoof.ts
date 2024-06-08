import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { DhcpServer } from "./dhcp/dhcpServer";
import { Helpers } from "./helpers";

interface ArpProcess {
    deviceId: string;
    process: ChildProcessWithoutNullStreams;
}

export class Spoof {
    static arps: ArpProcess[] = [];
    static ROUTER_IP = '192.168.0.1';

    static begin(delay: number, deviceIds: string[]) {
        let hosts = deviceIds.map(d => DhcpServer.getIPFromDeviceID(d));
        setTimeout(()=> {
            for (let host of hosts) {
                console.log("spoofing");
                let arp = spawn('arpspoof', 
                    ['-i',process.env.WIFI_ADAPTER as string,'-t',host,this.ROUTER_IP]);
                this.arps.push({deviceId: host, process: arp});
            }
        }, delay);
    }

    static cancel(deviceIds: string[]) {
        let copy = [...this.arps];
        for (let arp of copy) {
            if (deviceIds.indexOf(arp.deviceId) != -1) {
                arp.process.kill();
                this.arps = Helpers.removeAllFromArray(arp, this.arps);
            }
        }
    }
}

// https://nodejs.org/api/child_process.html#subprocesskillsignal