import { DomainChecker } from "./domainChecker";

const dgram = require('dgram');
const DnsForwarder = require('./dnsForwarder');

export class DnsSocket {
    static PORT = 5300;
    socket: any;
    dnsForwarder: any;
    domainChecker: DomainChecker;

    constructor(domainChecker: DomainChecker) {
        this.socket = dgram.createSocket('udp4');
        this.dnsForwarder = new DnsForwarder();
        this.domainChecker = domainChecker;

        this.socket.bind(DnsSocket.PORT, () => {
            console.log('UDP server listening on port ', DnsSocket.PORT);
        });
        
        this.socket.on('message', async (requestMessage: any, requestInfo: any) => {
            //console.log(`Received request message from ${requestInfo.address}:${requestInfo.port}:`);
        
            let response = this.dnsForwarder.get(requestMessage);
            if (response === null) {
                try {
                    await this.dnsForwarder.forward(requestMessage);
                    response = this.dnsForwarder.get(requestMessage);
                } catch (error) {
                    console.error('Error forwarding request:', error);
                    this.dnsForwarder.close();
                    return;
                }
            }
        
            this.socket.send(Buffer.from(response), requestInfo.port, requestInfo.address, (err: any) => {
                if (err) {
                    console.error(`Error sending response: ${err.message}`);
                    this.socket.close();
                } else {
                    //console.log('Response sent to client');
                }
            });
        });
    }
    
}
