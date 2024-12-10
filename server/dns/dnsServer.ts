import { RemoteInfo, Socket, createSocket } from "dgram";
import { DnsForwarder } from "./dnsForwarder";
import { DnsPacket } from "./dnsPacket";
import { Answer } from "./answer";
import { RedirectDestination, Redirector } from "./redirector";
import { ReturnCode } from "./header";
import { RecordType } from "./question";
import { SettingDb, SettingKey } from "../settings/settingDb";

export class DnsServer {
    static socket: Socket;
    static dnsForwarder: DnsForwarder;
    static dnsRedirector: Redirector;

    static HOLE_IP_v4: string = "240.0.0.0";
    static HOLE_IP_v6: Buffer = Buffer.from([100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]); //https://en.wikipedia.org/wiki/IPv6_address#Special_addresses

    // https://en.wikipedia.org/wiki/List_of_DNS_record_types
    static BLOCK_HTTPS = true;
    static BLOCK_TEXT = true;

    static async init() {
        let appIP = await SettingDb.getString(SettingKey.lanIp);
        let port: number = Number(process.env.DNS_PORT);
        this.socket = createSocket('udp4');
        this.dnsForwarder = new DnsForwarder(this.socket);
        this.dnsRedirector = new Redirector();

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
                    //pass through - does not alter packet, does not cache
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
                    packet.addAnswers([Answer.answerFromQuestion(packet.questions[0], appIP)]);
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
                    //send back garbage
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
                    //returns cached response if domains match
                    this.dnsForwarder.forward(buffer)
                        .then(answer => {
                            //add (cached) answer
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
            else { //pass response from upstream back to client
                this.dnsForwarder.processResponse(packet, buffer);
            }
        });

        this.socket.on('error', (err: any) => {throw(err);})
    }
}
