import { RemoteInfo, Socket, createSocket } from "dgram";
import { DnsPacket } from "./dnsPacket";
import { Answer } from "./answer";
import { RouterModel } from "../router/router";

export interface RedirectResult {
    isRedirected: boolean;
    ip4?: string | undefined;
    ip6?: Buffer | undefined;
}

//REQUIRED UNICAST? WHICH REQUIRES PYTHON
export class MDnsServer {
    static socket: Socket;

    static INADDR_ANY = '0.0.0.0'; //must stay at 0.0.0.0
    static port: number = 5353;
    static MCAST_DEST_MAC = "01:00:5e:00:00:fb";
    static MCAST_DEST_IP = "224.0.0.251";

    static init(localIP: string) {
        this.socket = createSocket({ type: 'udp4', reuseAddr: true });

        this.socket.bind(this.port, this.INADDR_ANY, () => {
            this.socket.setBroadcast(true);
            //console.log('MDNS server listening on UDP port ', this.port);
        });

        this.socket.on('message', async (buffer: Buffer, requestInfo: RemoteInfo) => {
            let sourceIP: string = localIP;

            let packet = DnsPacket.fromBuffer(buffer);
            if (!packet.header.isResponse) { //query
                let question = packet.questions[0];
                if (question && question.domainName.name.toLowerCase() == this.dotLocalHostname) {
                    packet.addAnswers([Answer.answerFromQuestion(packet.questions[0], sourceIP)])
                    packet.header.isResponse = true;
                    packet.header.isAuthority = true;

                    // Unicast.send(packet,
                    //     sourceMAC, this.MCAST_DEST_MAC,
                    //     sourceIP, this.MCAST_DEST_IP,
                    //     5353, 5353);
                    /*
                    this.socket.send(packet.writeToBuffer(), requestInfo.port, requestInfo.address, (err: any) => {
                        if (err) {
                            console.error(`Error sending response: ${err.message}`);
                            this.socket.close();
                        }
                    })
        this.socket.on("close", () => {
            throw ("oops closing!");
        });
                    */
                }
            }
        });

        this.socket.on('listening', () => {
            const address = this.socket.address();
            console.log(`MDNS server listening on ${address.address}:${address.port}`);
        });

        this.socket.on('error', (err: any) => { throw (err); })
    }

    static get dotLocalHostname(): string {
        return (process.env.HOSTNAME as string).toLowerCase() + ".local";
    }
}
