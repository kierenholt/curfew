import { RemoteInfo, Socket, createSocket } from "dgram";
import { DnsForwarder } from "./dnsForwarder";
import { DnsPacket } from "./dnsPacket";
import { Answer } from "./answer";

export class DnsServer {
    static PORT = 53;
    socket: Socket;
    dnsForwarder: DnsForwarder;
    allowRequest: (host: string, domain: string) => boolean;

    constructor(allowRequest: (host: string, domain: string) => boolean) {
        this.socket = createSocket('udp4');
        this.dnsForwarder = new DnsForwarder(DnsServer.PORT, this.socket);
        this.allowRequest = allowRequest;

        this.socket.bind(DnsServer.PORT, () => {
            console.log('DNS server listening on UDP port ', DnsServer.PORT);
        });
        
        this.socket.on('message', async (buf: Buffer, requestInfo: RemoteInfo) => {        
            let packet = DnsPacket.fromBuffer(buf);
            console.log("Request received for " + packet.questions[0].name);

            if (!packet.header.isResponse) { //query
                if (!this.allowRequest(requestInfo.address, packet.questions[0].name)) {
                    //block
                    packet.addAnswers([Answer.fromQuestion(packet.questions[0], requestInfo.address)]);
                    packet.header.isResponse = true;
                    packet.header.isAuthority = true;
                    this.socket.send(packet.writeToBuffer(), requestInfo.port, requestInfo.address, (err: any) => {
                        if (err) {
                            console.error(`Error sending response: ${err.message}`);
                            this.socket.close();
                        }
                    });
                    return;
                }

                //allow
                this.dnsForwarder.forward(buf)
                .then(answer => {
                    //add answer
                    packet.addAnswers(answer);
                    packet.header.isResponse = true;

                    //send
                    this.socket.send(packet.writeToBuffer(), requestInfo.port, requestInfo.address, (err: any) => {
                        if (err) {
                            console.error(`Error sending response: ${err.message}`);
                            this.socket.close();
                        }
                    });
                })
            }
            else { //process response from upstream
                this.dnsForwarder.processResponse(packet);
            }
        });

        this.socket.on('error', (err: any) => {throw(err);})
    }
}
