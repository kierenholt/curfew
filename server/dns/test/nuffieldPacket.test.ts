
//ORIGINAL DNS SECTION FROM PACKET - LENGTH 216 bytes
/***
 * 
 * 993	113.218790687	1.1.1.1	
 * 192.168.0.39	DNS	258	Standard query response 0x340d 
 * A account.nuffieldhealth.com 
 * CNAME nuffieldfrontend.azurefd.net 
 * CNAME azurefd-t-prod.trafficmanager.net 
 * CNAME shed.dual-low.s-part-0036.t-0009.t-msedge.net 
 * CNAME s-part-0036.t-0009.t-msedge.net 
 * A 13.107.246.64
 * 
 */

const test = require('node:test');
import assert from "node:assert";
import { DnsPacket } from "../dnsPacket";

//TEST - string to buffer, buffer to packet, check packet 5 answers, 1 question, CNAME of packet[3] should be CNAME: s-part-0036.t-0009.t-msedge.net 
test('read from nuffield buffer, write back to buffer', () => {
    let nuffieldBufferString = "\x34\x0d\x81\x80\x00\x01" +
    "\x00\x05\x00\x00\x00\x00\x07\x61\x63\x63\x6f\x75\x6e\x74\x0e\x6e" +
    "\x75\x66\x66\x69\x65\x6c\x64\x68\x65\x61\x6c\x74\x68\x03\x63\x6f" +
    "\x6d\x00\x00\x01\x00\x01\xc0\x0c\x00\x05\x00\x01\x00\x00\x00\x8c" +
    "\x00\x1e\x10\x6e\x75\x66\x66\x69\x65\x6c\x64\x66\x72\x6f\x6e\x74" +
    "\x65\x6e\x64\x07\x61\x7a\x75\x72\x65\x66\x64\x03\x6e\x65\x74\x00" +
    "\xc0\x38\x00\x05\x00\x01\x00\x00\x0d\x70\x00\x20\x0e\x61\x7a\x75" +
    "\x72\x65\x66\x64\x2d\x74\x2d\x70\x72\x6f\x64\x0e\x74\x72\x61\x66" +
    "\x66\x69\x63\x6d\x61\x6e\x61\x67\x65\x72\xc0\x51\xc0\x62\x00\x05" +
    "\x00\x01\x00\x00\x00\x3c\x00\x2c\x04\x73\x68\x65\x64\x08\x64\x75" +
    "\x61\x6c\x2d\x6c\x6f\x77\x0b\x73\x2d\x70\x61\x72\x74\x2d\x30\x30" +
    "\x33\x36\x06\x74\x2d\x30\x30\x30\x39\x08\x74\x2d\x6d\x73\x65\x64" +
    "\x67\x65\xc0\x51\xc0\x8e\x00\x05\x00\x01\x00\x00\x00\x3c\x00\x02" +
    "\xc0\x9c\xc0\x9c\x00\x01\x00\x01\x00\x00\x00\x3c\x00\x04\x0d\x6b" +
    "\xf6\x40";
    let packet = DnsPacket.fromBuffer(Buffer.from(nuffieldBufferString, "ascii"));
    assert(packet.answers[0].domainName.name == "account.nuffieldhealth.com");
    assert(packet.answers[1].domainName.name == "nuffieldfrontend.azurefd.net");
    assert(packet.answers[2].domainName.name == "azurefd-t-prod.trafficmanager.net");
    assert(packet.answers[3].domainName.name == "shed.dual-low.s-part-0036.t-0009.t-msedge.net");
    assert(packet.answers[4].domainName.name == "s-part-0036.t-0009.t-msedge.net");

    let writeBack = packet.writeToBuffer();
    assert(writeBack.length == nuffieldBufferString.length);
});