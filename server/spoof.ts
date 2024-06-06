import { spawn } from "child_process";
import { DhcpServer } from "./dhcp/dhcpServer";
import { Device } from "./db/device";

// https://nodejs.org/api/child_process.html#subprocesskillsignal
export function spoof(delay: number, duration: number, deviceIds: string[]) {
    let hosts = deviceIds.map(d => DhcpServer.getIPFromDeviceID(d));
    setTimeout(()=> {
        for (let host of hosts) {
            console.log("spoofing");
            const arp = spawn('arpspoof', 
                ['-i',process.env.WIFI_ADAPTER as string,'-t',host,'192.168.0.1']);
            setTimeout(() => arp.kill(), duration); 
        }
    }, delay);
}