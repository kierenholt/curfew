import { DnsPacket } from "./dnsPacket";
import { Cache } from "./cache";
const dgram = require('dgram');

export class DnsForwarder {
    cache: Cache;
    client: any;
    UPSTREAM_SERVER_IP: string = '1.1.1.1';

    constructor() {
        this.client = dgram.createSocket('udp4');
        this.cache = new Cache();
    }

    forward(request: Buffer): Promise<Buffer> {
        let packet = new DnsPacket(request);
        let cached = this.cache.get(packet);
        if (cached) {
            return Promise.resolve(cached);
        }
        return new Promise((resolve, reject) => {
            this.client.send(request, 53, this.UPSTREAM_SERVER_IP, (error: any) => {
                //console.log("Request sent to dns server")
                if (error) {
                    console.error('Error sending message:', error);
                    this.client.close();
                } else {
                    this.client.once('message', (responseMsg: any, responseInfo: any) => {
                        this.cache.upsert(packet, responseMsg);
                        resolve(responseMsg);
                    });
                }
            });
        });
    }

    close(){
        this.client.close();
    }
}