import { Helpers } from "../helpers";
import { IWriteToBuffer } from "../python/unicast";
import { Option } from "./option";

export enum RequestReply { request = 1, reply = 2 }
export enum MessageType { DHCPDISCOVER = 1, DHCPOFFER = 2, DHCPREQUEST = 3, 
    DHCPDECLINE = 4, DHCPACK = 5, DHCPNAK = 6, DHCPRELEASE = 7, DHCPINFORM = 8 }

//https://efficientip.com/glossary/dhcp-option/ 
export class DhcpPacket implements IWriteToBuffer {
    
    headerBuffer: Buffer;
    options: Option[] = [];
    
    constructor(buf: Buffer) {
        this.headerBuffer = buf.subarray(0, 240);
        let obj: {r: number, o: Option } = {r: 240, o: new Option(0,0,Buffer.from([]))};
        while(buf[obj.r] != 0xff) {
            obj = Option.fromBuffer(buf, obj.r);
            this.options.push(obj.o);
        }
    }

    get requestsBroadcast(): boolean { //byte 10
        return (this.headerBuffer[10] & 0x80) == 0x80;
    }

    get requestReply(): RequestReply { //byte 0
        return this.headerBuffer[0];
    }

    set requestReply(value: RequestReply) {
        this.headerBuffer[0] = value;
    }

    get transactionId(): number {  //bytes 4 - 7
        return this.headerBuffer.readUInt32BE(4);
    }

    set transactionId(value: number) {
        this.headerBuffer.writeUInt32BE(value, 4);
    }

    get clientIP(): string {  //bytes 12 - 15
        return Helpers.readIP(this.headerBuffer, 12);
    }

    set clientIP(value: string) {
        Helpers.writeIP(value, this.headerBuffer, 12);
    }

    get yourIP(): string {  //bytes 16 - 19
        return Helpers.readIP(this.headerBuffer, 16);
    }

    set yourIP(value: string) {
        Helpers.writeIP(value, this.headerBuffer, 16);
    }

    get serverIP(): string {  //bytes 20 - 23
        return Helpers.readIP(this.headerBuffer, 20);
    }

    set serverIP(value: string) {
        Helpers.writeIP(value, this.headerBuffer, 20);
    }

    get clientMAC(): string {  //bytes 28 - 34
        return Helpers.readMAC(this.headerBuffer, 28);
    }

    set clientMAC(value: string) {
        Helpers.writeMAC(value, this.headerBuffer, 28);
    }

    get serverName(): string {  //bytes 44
        return this.headerBuffer.subarray(44).toString('utf8');
    }

    set serverName(value: string) {
        this.headerBuffer.write(value, 44);
    }

    get messageType(): MessageType {
        let found = this.options.filter(o => o.code == 53);
        if (found.length == 0) {
            throw('option 53 not found');
        } 
        return found[0].rdata[0];
    }

    get hostName(): string {
        let found = this.options.filter(o => o.code == 12);
        if (found.length == 0) {
            return '';
        } 
        return found[0].rdata.toString();
    }

    setAsOffer(yourIP: string, serverIP: string, 
        routerIP: string, leaseTime: number, subnet: string) {
        this.requestReply = RequestReply.reply;
        this.yourIP = yourIP;
        this.serverIP = serverIP;
        this.options = [
            new Option(53, 1, Buffer.from([MessageType.DHCPOFFER])),
            new Option(54, 4, Helpers.IPAsBuffer(serverIP)),
            new Option(51, 4, Helpers.Int32AsBuffer(leaseTime)),
            new Option(1, 4, Helpers.IPAsBuffer(subnet)),
            new Option(3, 4, Helpers.IPAsBuffer(routerIP)),
            new Option(6, 4, Helpers.IPAsBuffer(serverIP)),
            new Option(255, 0, Buffer.from([]))
        ]
    }


    setAsAck(yourIP: string, serverIP: string, 
        routerIP: string, leaseTime: number, subnet: string) {
        this.requestReply = RequestReply.reply;
        this.yourIP = yourIP;
        this.serverIP = serverIP;
        this.options = [
            new Option(53, 1, Buffer.from([MessageType.DHCPACK])),
            new Option(54, 4, Helpers.IPAsBuffer(serverIP)),
            new Option(51, 4, Helpers.Int32AsBuffer(leaseTime)),
            new Option(1, 4, Helpers.IPAsBuffer(subnet)),
            new Option(3, 4, Helpers.IPAsBuffer(routerIP)),
            new Option(6, 4, Helpers.IPAsBuffer(serverIP)),
            new Option(255, 0, Buffer.from([]))
        ]
    }

    writeToBuffer(): Buffer {
        let optionsBuffer = Buffer.alloc(512);
        let w = 0;
        for (let o of this.options) {
            w = o.writeToBuffer(optionsBuffer, w);
        };
        return Buffer.concat([this.headerBuffer, optionsBuffer.subarray(0, w)]);
    }
}