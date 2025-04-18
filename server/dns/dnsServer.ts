import { RemoteInfo, Socket, createSocket } from "dgram";
import { DnsForwarder } from "./dnsForwarder";
import { DnsPacket } from "./dnsPacket";
import { Answer } from "./answer";
import { RedirectDestination, Redirector } from "./redirector";
import { ReturnCode } from "./header";
import { RecordType } from "./question";
import { CurfewDb } from "../db";
import { SettingKey } from "../settings/types";
import { Helpers } from "../utility/helpers";

export class DnsServer {
    static socket: Socket;
    static dnsForwarder: DnsForwarder;
    static dnsRedirector: Redirector;

    static HOLE_IP_v4: string = "240.0.0.0";
    static HOLE_IP_v6: Buffer = Buffer.from([100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]); //https://en.wikipedia.org/wiki/IPv6_address#Special_addresses

    // https://en.wikipedia.org/wiki/List_of_DNS_record_types
    static BLOCK_HTTPS = true;
    static BLOCK_TEXT = true;

    static async start(db: CurfewDb) {
        let port: number = Number(process.env.DNS_PORT);
        this.socket = createSocket('udp4');
        this.dnsForwarder = new DnsForwarder(this.socket, await db.settingQuery.getString(SettingKey.upstreamDnsServer));
        this.dnsRedirector = new Redirector(db);
        let networkId = await db.settingQuery.getString(SettingKey.networkId);
        let thisHost = await db.settingQuery.getString(SettingKey.thisHost);
        let appIP = Helpers.combineIpAddresses(networkId, thisHost);

        this.socket.bind(port, () => {
            console.log('✓ DNS server listening on UDP port ', port);
        });

        this.socket.on('message', async (buffer: Buffer, requestInfo: RemoteInfo) => {
            let packet = DnsPacket.fromBuffer(buffer);
            //console.log("Request received for " + packet.questions[0].name);

            if (!packet.header.isResponse) { //query

                let destination = await this.dnsRedirector.decide(requestInfo.address, packet.questions[0].name);
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
                    //console.log(`forwarding ${packet.answers[0].domainName.name} as ${packet.answers[0].IPAddress} to ${requestInfo.address}`);
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
                        .then(responsePacket => {
                            //console.log(`forwarding ${answer[0].domainName.name} as ${answer[0].IPAddress} to ${requestInfo.address}`);
                            //write to db
                            responsePacket.dropIPv6Answers();

                            let IP = responsePacket.findARecord();
                            if (responsePacket.questions.length > 0 && IP != null)
                                db.dnsQuery.createResponse(
                                    responsePacket.questions[0].domainName.name,
                                    IP,
                                    new Date().valueOf(),
                                    requestInfo.address)

                            responsePacket.header.isResponse = true;
                            responsePacket.header.id = packet.header.id;

                            //send
                            this.socket.send(responsePacket.writeToBuffer(), requestInfo.port, requestInfo.address, (err: any) => {
                                if (err) {
                                    console.error(`Error sending response: ${err.message}`);
                                    this.socket.close();
                                }
                            });
                        })
                }

                if (destination == RedirectDestination.ignore) {
                    //do nothing
                }
            }
            else { //pass response from upstream back to client
                this.dnsForwarder.processResponse(packet, buffer);
            }
        });

        this.socket.on('error', (err: any) => { throw (err); })
    }
}
