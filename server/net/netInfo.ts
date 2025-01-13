import { NetworkInterfaceInfo, networkInterfaces } from 'os';

export class NetInfo {
    name: string;
    address: string;
    netmask: string;
    mac: string;

/*
    address: '192.168.1.108',
    netmask: '255.255.255.0',
    family: 'IPv4',
    mac: '01:02:03:0a:0b:0c',
    internal: false,
    cidr: '192.168.1.108/24'
*/
    constructor() {
        let dump: any = networkInterfaces();
        let foundNetworkInfo = null;
        let foundName = "";
        for (let name in dump) {
            let found = dump[name].filter((protocol: any) => {
                return protocol.family == "IPv4" &&
                    protocol.mac != "00:00:00:00:00:00" &&
                    (protocol.internal == false)
            });
            if (found.length > 0) {
                foundNetworkInfo = found[0] as NetworkInterfaceInfo;
                foundName = name;
                continue;
            }
        }
        
        if (foundNetworkInfo == null || foundName == "") {
            throw("! local network interface not found");
        }
        
        this.name = foundName;
        this.address = foundNetworkInfo.address;
        this.netmask = foundNetworkInfo.netmask;
        this.mac = foundNetworkInfo.mac;
    }
}