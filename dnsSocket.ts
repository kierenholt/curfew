import { RemoteInfo, Socket } from "dgram";
import { DomainChecker } from "./domainChecker";
import { DnsForwarder } from "./dnsForwarder";

const dgram = require('dgram');

export class DnsSocket {
    static PORT = 5300;
    socket: Socket;
    dnsForwarder: DnsForwarder;
    domainChecker: DomainChecker;

    constructor(domainChecker: DomainChecker) {
        this.socket = dgram.createSocket('udp4');
        this.dnsForwarder = new DnsForwarder();
        this.domainChecker = domainChecker;

        this.socket.bind(DnsSocket.PORT, () => {
            console.log('DNS server listening on UDP port ', DnsSocket.PORT);
        });
        
        this.socket.on('message', async (requestMessage: Buffer, requestInfo: RemoteInfo) => {
            //console.log(`Received request message from ${requestInfo.address}:${requestInfo.port}:`);
        
            let response = await this.dnsForwarder.forward(requestMessage);
            if (response === null) {
                console.error('Error forwarding request:');
            }
        
            // overwrite id
            response[0] = requestMessage[0];
            response[1] = requestMessage[1];

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
