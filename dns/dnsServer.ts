import { RemoteInfo, Socket, createSocket } from "dgram";
import { DnsForwarder } from "./dnsForwarder";
import { DnsPacket } from "./dnsPacket";
import { Answer } from "./answer";
import { DnsRedirector } from "../dnsRedirector";

export class DnsServer {
    static PORT = 53;
    static socket: Socket;
    static dnsForwarder: DnsForwarder;
    static dnsRedirector: DnsRedirector;

    static init() {
        this.socket = createSocket('udp4');
        this.dnsForwarder = new DnsForwarder(DnsServer.PORT, this.socket);
        this.dnsRedirector = new DnsRedirector();

        this.socket.bind(DnsServer.PORT, () => {
            console.log('DNS server listening on UDP port ', DnsServer.PORT);
        });
        
        this.socket.on('message', async (buf: Buffer, requestInfo: RemoteInfo) => {        
            let packet = DnsPacket.fromBuffer(buf);
            console.log("Request received for " + packet.questions[0].name);

            if (!packet.header.isResponse) { //query
                let redirectResult = await this.dnsRedirector.redirect(requestInfo.address, packet.questions[0].name);
                
                if (redirectResult.isRedirected && redirectResult.ip4 != null) {
                    //block
                    packet.addAnswers([Answer.answerFromQuestion(packet.questions[0], redirectResult.ip4, redirectResult.ip6)]);
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
