import { RemoteInfo, Socket, createSocket } from "dgram";
import { DhcpPacket, MessageType, RequestReply } from "./dhcpPacket";
import { Lease, LeaseState } from "./lease";
import { start } from "repl";
import { Helpers } from "../helpers";
import { Unicast } from "../python/unicast";

export class DhcpServer {
    static SERVER_PORT = 67;
    static CLIENT_PORT = 68;
    static INADDR_ANY = '0.0.0.0'; //must stay at 0.0.0.0
    
    socket: Socket;
    rangeStart: string = "192.168.0.10";
    rangeEnd: string = "192.168.0.70";
    subnet: string = '255.255.255.0';
    router: string = '192.168.0.1';
    broadcastIP: string = '192.168.0.255';
    serverIP: string = '192.168.0.78';
    hostname: string = "curfew";
    serverMAC: string = '30:f7:72:45:53:f5';


    leases: Lease[] = [];

    constructor() {
        this.socket = createSocket({ type: 'udp4', reuseAddr: true });

        this.socket.bind(DhcpServer.SERVER_PORT, DhcpServer.INADDR_ANY, () => {
            this.socket.setBroadcast(true);
            console.log('DHCP listening on port', this.socket);
        });

        this.socket.on('message', (buf: Buffer, requestInfo: RemoteInfo) => {
            let requestPacket = new DhcpPacket(buf);
            if (requestPacket.requestReply == RequestReply.reply) { return }

            //respond to discover with offer 
            if (requestPacket.messageType == MessageType.DHCPDISCOVER) {
                this.sendOffer(requestPacket);
            }

            //respond to request with 
            if (requestPacket.messageType == MessageType.DHCPREQUEST) {
                this.sendAck(requestPacket);
            }
        });

        this.socket.on('error', (e: any) => {
            throw(e);
        });
    }

    sendOffer(requestPacket: DhcpPacket) {
        let lease = this.selectAddress(requestPacket);
        requestPacket.setAsOffer(lease.IP, this.serverIP, 
            this.router, Lease.lifetime, this.subnet);

        if (!requestPacket.requestsBroadcast) {
            Unicast.send(requestPacket, 
                this.serverMAC, requestPacket.clientMAC,
                this.serverIP, requestPacket.yourIP);
        }
        else {
            this.socket.send(requestPacket.writeToBuffer(), 
                DhcpServer.CLIENT_PORT, this.broadcastIP, 
                (err: any) => {
                if (err) {
                    console.error(`Error sending response: ${err.message}`);
                    this.socket.close();
                }
            });
        }
    }

    sendAck(requestPacket: DhcpPacket) {
        let foundLease = this.selectAddress(requestPacket);

        if (foundLease == null) return;
        
        requestPacket.setAsAck(foundLease.IP, this.serverIP, 
            this.router, Lease.lifetime, this.subnet);
        
        if (!requestPacket.requestsBroadcast) {
            Unicast.send(requestPacket, 
                this.serverMAC, requestPacket.clientMAC,
                this.serverIP, requestPacket.yourIP);
        }
        else {
            this.socket.send(requestPacket.writeToBuffer(), 
                DhcpServer.CLIENT_PORT, this.broadcastIP, 
                (err: any) => {
                if (err) {
                    console.error(`Error sending response: ${err.message}`);
                    this.socket.close();
                }
            });
        }
    }

    selectAddress(requestPacket: DhcpPacket): Lease {
        //https://techhub.hpe.com/eginfolib/networking/docs/switches/5120si/cg/5998-8491_l3-ip-svcs_cg/content/436042663.htm

        //try most recent transaction
        let mostRecentTransactionId = requestPacket.transactionId;
        let foundLeases = this.leases.filter(l => l.mostRecentTransactionId == mostRecentTransactionId);
        if (foundLeases.length) {
            return foundLeases[0];
        }

        //try to offer preferred ip
        let preferredIp = requestPacket.clientIP;
        if (preferredIp != "0.0.0.0") {
            let withSameIP = this.leases.filter(l => l.IP == preferredIp);
            if (withSameIP.length) {
                //matching MAC to let them have it
                if (withSameIP[0].MAC == requestPacket.clientMAC) {
                    return withSameIP[0];
                }
                //different MAC so they need a different IP
            }
            else { //nobody has the IP so give it away
                let lease = new Lease(requestPacket.clientMAC, requestPacket.clientIP, 
                    requestPacket.transactionId);
                this.leases.push(lease);
                return lease;
            }
        }

        let withSameMAC = this.getLeaseWithSameMAC(requestPacket.clientMAC);
        if (withSameMAC) {
            withSameMAC.state = LeaseState.offered;
            withSameMAC.expires = new Date().valueOf() + Lease.lifetime;
            withSameMAC.mostRecentTransactionId = requestPacket.transactionId;
            return withSameMAC;
        }

        //try option 50
        let foundOptions = requestPacket.options.filter(o => o.code == 50);
        if (foundOptions.length) {
            let requestedIP = Helpers.readIP(foundOptions[0].rdata, 0);
            let lease = new Lease(requestPacket.clientMAC, requestedIP, requestPacket.transactionId);
            this.leases.push(lease);
            return lease;
        }
        
        let offeredIp = Helpers.chooseRandom(this.possibleIPs);
        let lease = new Lease(requestPacket.clientMAC, offeredIp, requestPacket.transactionId);
        this.leases.push(lease);
        return lease;
    }

    get possibleIPs(): string[] {
        let startIndex = this.rangeStart.lastIndexOf('.');
        let endIndex = this.rangeEnd.lastIndexOf('.');
        if (this.rangeStart.substring(0, startIndex) != this.rangeEnd.substring(0, endIndex)) {
            throw('invalid range - first 3 sections of start and end must be equal'); 
        }
        let prefix = this.rangeStart.substring(0, startIndex);
        let startN = parseInt(this.rangeStart.substring(startIndex+1));
        let endN = parseInt(this.rangeEnd.substring(startIndex+1));
        let possibleIPs = [];
        for (let i = startN; i <= endN; i++) {
            possibleIPs.push(prefix + '.' + i.toString());
        }
        //remove taken IPs
        possibleIPs = Helpers.difference(possibleIPs, this.leases.map(l => l.IP));
        return possibleIPs;
    }

    getLeaseWithSameMAC(MAC: string): Lease | null {
        let withSameMAC = this.leases.filter(l => l.MAC == MAC);
        if (withSameMAC.length) {
            return withSameMAC[0];
        }
        return null;
    }
}


