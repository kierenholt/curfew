
export class DetectNetwork {
    static foundProtocols:any = [];
    
    static init() {
        var os = require("os");
        let dump = os.networkInterfaces();
        for (let name in dump) {
            let found = dump[name].filter((protocol: any) => {
                return protocol.family == "IPv4" &&
                    protocol.mac != "00:00:00:00:00:00" &&
                    (protocol.internal == false)
            });
            this.foundProtocols.push(...found);
        }
    }

    static get localIP() {
        return this.foundProtocols[0].address;
    }
    static get mac() {
        return this.foundProtocols[0].mac;
    }
}