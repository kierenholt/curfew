import { spawn } from "child_process";
import { Helpers } from "../helpers";
import { DhcpPacket } from "../dhcp/dhcpPacket";


export class Unicast {


    static send(packet: DhcpPacket, 
        sourceMAC: string, destMAC: string,
        sourceIP: string, yourIP: string) {
        //https://stackoverflow.com/questions/52412385/is-dhcp-request-message-a-broadcast-or-unicast
        let windows = 'a0:59:50:24:4c:df';

        let dhcpBuf = packet.writeToBuffer();
        let ethernetLength = 14;
        let IPLength = 20;
        let UDPLength = 8;
        let DHCPLength = dhcpBuf.length;

        //ethernet length 14
        let ethernetBuf = Buffer.alloc(ethernetLength);
        Helpers.writeMAC(destMAC, ethernetBuf, 0); //dest MAC
        Helpers.writeMAC(sourceMAC, ethernetBuf, 6); //src MAC
        ethernetBuf.writeUInt16BE(0x0800, 12); //type IPv4

        //IP length 20
        let IPBuf = Buffer.alloc(IPLength);
        IPBuf[0] = 0x45; //version and header length
        IPBuf[1] = 0x10; //Differentiated services? ? ?
        IPBuf.writeUint16BE(IPLength + UDPLength + DHCPLength, 2); //IP total length
        //IPBuf.writeUint16BE(0, 4);  id leave zero 
        IPBuf.writeUint16BE(0x4000, 6); //flags
        IPBuf[8] = 64; //ttl
        IPBuf[9] = 0x11; //udp protocol
        //checksum 10 and 11
        Helpers.writeIP(sourceIP, IPBuf, 12); //source IP
        Helpers.writeIP(yourIP, IPBuf, 16); //dest IP

        //UDP length 8
        let UDPBuf = Buffer.alloc(8);
        UDPBuf.writeUInt16BE(0x0043, 0); //source port 67
        UDPBuf.writeUInt16BE(0x0044, 2); //dest port 68
        UDPBuf.writeUInt16BE(UDPLength + DHCPLength, 4); //UDP total length
        
        let fullBuf = Buffer.concat([ethernetBuf, IPBuf, UDPBuf, dhcpBuf]);
        
        //UDP checksum
        //http://profesores.elo.utfsm.cl/~agv/elo322/UDP_Checksum_HowTo.html
        let UDPChecksumIndex = ethernetLength + IPLength + 6;
        let startSum = 0x11 + UDPLength + DHCPLength;
        let UDPChecksum = Unicast.calculateUDPChecksum(fullBuf, ethernetLength + 12, startSum); //include protocol
        fullBuf.writeUInt16BE(UDPChecksum, UDPChecksumIndex);
        Unicast.verifyUDPChecksum(fullBuf, ethernetLength + 12, startSum);
        
        //IP checksum
        //https://en.wikipedia.org/wiki/Internet_checksum
        let IPChecksumIndex = ethernetLength + 10;
        let IPChecksum = Unicast.calculateIPChecksum(fullBuf, ethernetLength, ethernetLength + IPLength - 1);
        fullBuf.writeUInt16BE(IPChecksum, IPChecksumIndex);
        Unicast.verifyIPChecksum(fullBuf, ethernetLength, ethernetLength + IPLength - 1);
        
        let fullString: string = Helpers.readAsHexString(fullBuf);
        //console.log(fullString);
        //hexString = 'a0 59 50 24 4c df 30 f7 72 45 53 f5 08 06 00 01 08 00 06 04 00 01 30 f7 72 45 53 f5 C0 A8 00 4e 00 00 00 00 00 00 C0 A8 00 01 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00';
        let p = spawn('python3', ['sender.py', fullString])
    
        p.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
          });
          
        p.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
    
    }

    static calculateUDPChecksum(buf: Buffer, startIndex: number, startSum: number) {
        let c = startSum;
        for (let i = startIndex; i < buf.length; i+=2) {
            if (i == buf.length - 1) { //last bit
                c += (buf[i] << 8);
            }
            else {
                c += buf.readUInt16BE(i);
            }
        }
        let carried = (c & 0xff0000) >> 16;
        c = (c & 0xffff);
        return 0xffff - c - carried;
    }

    static verifyUDPChecksum(buf: Buffer, startIndex: number, startSum: number) {
        let c = startSum;
        for (let i = startIndex; i < buf.length; i+=2) {
            if (i == buf.length - 1) { //last bit
                c += (buf[i] << 8);
            }
            else {
                c += buf.readUInt16BE(i);
            }
        }
        let carried = (c & 0xff0000) >> 16;
        c += carried;
        c = (c & 0xffff);
        if (c != 0xffff) throw("checksum failed");
    }

    static calculateIPChecksum(buf: Buffer, startIndex: number, endIndex: number) {
        let c = 0;
        for (let i = startIndex; i <= endIndex; i+=2) {
            c += buf.readUInt16BE(i);
        }
        let carried = (c & 0xff0000) >> 16;
        c = (c & 0xffff);
        return 0xffff - c - carried;
    }

    static verifyIPChecksum(buf: Buffer, startIndex: number, endIndex: number) {
        let c = 0;
        for (let i = startIndex; i <= endIndex; i+=2) {
            c += buf.readUInt16BE(i);
        }
        let carried = (c & 0xff0000) >> 16;
        c += carried;
        c = (c & 0xffff);
        if (c != 0xffff) throw("checksum failed");
    }

}