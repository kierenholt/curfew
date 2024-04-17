"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DnsSocket = void 0;
const dnsForwarder_1 = require("./dnsForwarder");
const dgram = require('dgram');
class DnsSocket {
    constructor(domainChecker) {
        this.socket = dgram.createSocket('udp4');
        this.dnsForwarder = new dnsForwarder_1.DnsForwarder();
        this.domainChecker = domainChecker;
        this.socket.bind(DnsSocket.PORT, () => {
            console.log('UDP server listening on port ', DnsSocket.PORT);
        });
        this.socket.on('message', (requestMessage, requestInfo) => __awaiter(this, void 0, void 0, function* () {
            //console.log(`Received request message from ${requestInfo.address}:${requestInfo.port}:`);
            let response = yield this.dnsForwarder.forward(requestMessage);
            if (response === null) {
                console.error('Error forwarding request:');
            }
            // overwrite id
            response[0] = requestMessage[0];
            response[1] = requestMessage[1];
            this.socket.send(Buffer.from(response), requestInfo.port, requestInfo.address, (err) => {
                if (err) {
                    console.error(`Error sending response: ${err.message}`);
                    this.socket.close();
                }
                else {
                    //console.log('Response sent to client');
                }
            });
        }));
    }
}
exports.DnsSocket = DnsSocket;
DnsSocket.PORT = 5300;
//# sourceMappingURL=dnsSocket.js.map