import { RemoteInfo, Socket, createSocket } from "dgram";
import { DnsForwarder } from "./dnsForwarder";
import { DnsPacket } from "./dnsPacket";
import { Answer } from "./answer";
import { RedirectDestination, Redirector } from "../redirector";
import { DetectNetwork } from "../localnetwork";
import { ReturnCode } from "./header";
import { RecordType } from "./question";

export interface RedirectResult {
    isRedirected: boolean; 
    ip4?: string | undefined; 
    ip6?: Buffer | undefined;
}


export class DnsServer {
    static socket: Socket;
    static dnsForwarder: DnsForwarder;
    static dnsRedirector: Redirector;

    static HOLE_IP_v4: string = "240.0.0.0";
    static HOLE_IP_v6: Buffer = Buffer.from([100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]); //https://en.wikipedia.org/wiki/IPv6_address#Special_addresses
    static appIP: string;

    // https://en.wikipedia.org/wiki/List_of_DNS_record_types
    static BLOCK_HTTPS = true;
    static BLOCK_TEXT = true;

    static init() {
        let port: number = Number(process.env.DNS_PORT);
        this.socket = createSocket('udp4');
        this.dnsForwarder = new DnsForwarder(this.socket);
        this.dnsRedirector = new Redirector();
        this.appIP = DetectNetwork.localIP;

        this.socket.bind(port, () => {
            console.log('DNS server listening on UDP port ', port);
        });
        
        this.socket.on('message', async (buffer: Buffer, requestInfo: RemoteInfo) => {        
            let packet = DnsPacket.fromBuffer(buffer);
            //console.log("Request received for " + packet.questions[0].name);

            if (!packet.header.isResponse) { //query

                let destination = await Redirector.redirectTo(requestInfo.address, packet.questions[0].name);
                // unfiltered groups
                if (destination == RedirectDestination.passThrough) {
                    //console.log("waiting for pass through");

                    this.dnsForwarder.passThrough(buffer)
                    .then(responseBuffer => {
                        //console.log("sending pass through");
                        //send
                        this.socket.send(responseBuffer, requestInfo.port, requestInfo.address, (err: any) => {
                            if (err) {
                                console.error(`Error sending response: ${err.message}`);
                                this.socket.close();
                            }
                        });
                    })
                }
                
                if (destination == RedirectDestination.app) {
                    packet.addAnswers([Answer.answerFromQuestion(packet.questions[0], this.appIP)]);
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

                // block HTTPS and TXT - code does not support it
                if (packet.questions[0].qtype == RecordType.TXT || 
                    (this.BLOCK_HTTPS && packet.questions[0].qtype == RecordType.HTTPS)) {
                    packet.header.isResponse = true;
                    packet.header.isAuthority = true;
                    packet.header.setReplyCode(ReturnCode.refused);
                    this.socket.send(packet.writeToBuffer(), requestInfo.port, requestInfo.address, (err: any) => {
                        if (err) {
                            console.error(`Error sending response: ${err.message}`);
                            this.socket.close();
                        }
                    });
                    return;
                }
                
                if (destination == RedirectDestination.hole) {
                     
                    packet.addAnswers([Answer.answerFromQuestion(packet.questions[0], this.HOLE_IP_v4, this.HOLE_IP_v6)]);
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

                if (destination == RedirectDestination.shortTTL) {
                    //no redirect
                    this.dnsForwarder.forward(buffer)
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
            }
            else { //process response from upstream
                this.dnsForwarder.processResponse(packet, buffer);
            }
        });

        this.socket.on('error', (err: any) => {throw(err);})
    }
}
