import { networkInterfaces } from 'os';

export class NetInfo {

    static getNameAndProtocol(): [string, any] {
        let dump: any = networkInterfaces();
        for (let name in dump) {
            let found = dump[name].filter((protocol: any) => {
                return protocol.family == "IPv4" &&
                    protocol.mac != "00:00:00:00:00:00" &&
                    (protocol.internal == false)
            });
            if (found[0]) {
                return [name, found[0]]
            }
        }
        return ["", null]
    }
}