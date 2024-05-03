import { Cache } from "./cache";
import { Socket } from "dgram";
import { DnsPacket2 as DnsPacket } from "./dnsPacket";
const dgram = require('dgram');

export class DnsForwarder {
    cache: Cache;
    socket: Socket;
    UPSTREAM_SERVER_IP: string = '1.1.1.1';
    TTL: number = 30;

    constructor() {
        this.socket = dgram.createSocket('udp4');
        this.cache = new Cache();
    }

    forward(request: Buffer): Promise<Buffer> {
        let requestPacket: DnsPacket = DnsPacket.fromBuffer(request);
        console.log("Request received for " + requestPacket.questions[0].qname);
        
        let cached = this.cache.get(requestPacket);
        if (cached) {
            return Promise.resolve(cached);
        }
        return new Promise((resolve, reject) => {
            this.socket.send(request, 53, this.UPSTREAM_SERVER_IP, (error: any) => {
                if (error) {
                    console.error('Error sending message:', error);
                    this.socket.close();
                } else {
                    this.socket.once('message', (responseMsg: Buffer, responseInfo: any) => {
                        responseMsg = this.overrideTTL(responseMsg);
                        this.cache.upsert(requestPacket, responseMsg);
                        resolve(responseMsg);
                    });
                }
            });
        });
    }

    close(){
        this.socket.close();
    }

    overrideTTL(buf: Buffer): Buffer {
        let packet = DnsPacket.fromBuffer(buf);
        packet.answers.forEach(a => a.ttl = this.TTL);
        return packet.writeToBuffer();
    }
}