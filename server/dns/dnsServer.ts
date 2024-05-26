import { RemoteInfo, Socket, createSocket } from "dgram";
import { DnsForwarder } from "./dnsForwarder";
import { DnsPacket } from "./dnsPacket";
import { Answer } from "./answer";
import { RedirectDestination, Redirector } from "../redirector";

export interface RedirectResult {
    isRedirected: boolean; 
    ip4?: string | undefined; 
    ip6?: Buffer | undefined;
}


export class DnsServer {
    static PORT = 53;
    static socket: Socket;
    static dnsForwarder: DnsForwarder;
    static dnsRedirector: Redirector;

    static NULL_IP_v4: string = "240.0.0.0";
    static NULL_IP_v6: Buffer = Buffer.from([100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]); //https://en.wikipedia.org/wiki/IPv6_address#Special_addresses
    static LOCALHOST: string = "127.0.0.1";

    static init() {
        this.socket = createSocket('udp4');
        this.dnsForwarder = new DnsForwarder(DnsServer.PORT, this.socket);
        this.dnsRedirector = new Redirector();

        this.socket.bind(DnsServer.PORT, () => {
            console.log('DNS server listening on UDP port ', DnsServer.PORT);
        });
        
        this.socket.on('message', async (buf: Buffer, requestInfo: RemoteInfo) => {        
            let packet = DnsPacket.fromBuffer(buf);
            console.log("Request received for " + packet.questions[0].name);

            if (!packet.header.isResponse) { //query
                let destination = await Redirector.redirectTo(requestInfo.address, packet.questions[0].name);
                if (destination == RedirectDestination.blocked ||
                    destination == RedirectDestination.app) {
                    
                    if (destination == RedirectDestination.app) { //app
                        packet.addAnswers([Answer.answerFromQuestion(packet.questions[0], this.LOCALHOST)]);
                    }
                    else { //blocked
                        packet.addAnswers([Answer.answerFromQuestion(packet.questions[0], this.NULL_IP_v4, this.NULL_IP_v6)]);
                    }
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

                //no redirect
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
