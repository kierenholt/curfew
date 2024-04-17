"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DnsForwarder = void 0;
const dnsPacket_1 = require("./dnsPacket");
const cache_1 = require("./cache");
const dgram = require('dgram');
class DnsForwarder {
    constructor() {
        this.UPSTREAM_SERVER_IP = '1.1.1.1';
        this.client = dgram.createSocket('udp4');
        this.cache = new cache_1.Cache();
    }
    forward(request) {
        let packet = new dnsPacket_1.DnsPacket(request);
        let cached = this.cache.get(packet);
        if (cached) {
            return Promise.resolve(cached);
        }
        return new Promise((resolve, reject) => {
            this.client.send(request, 53, this.UPSTREAM_SERVER_IP, (error) => {
                //console.log("Request sent to dns server")
                if (error) {
                    console.error('Error sending message:', error);
                    this.client.close();
                }
                else {
                    this.client.once('message', (responseMsg, responseInfo) => {
                        this.cache.upsert(packet, responseMsg);
                        resolve(responseMsg);
                    });
                }
            });
        });
    }
    close() {
        this.client.close();
    }
}
exports.DnsForwarder = DnsForwarder;
//# sourceMappingURL=dnsForwarder.js.map