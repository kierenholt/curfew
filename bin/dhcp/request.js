"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DhcpRequest = void 0;
const seqbuffer_1 = require("./seqbuffer");
class DhcpRequest {
    constructor(buf) {
        if (buf.length < 230) { // 230 byte minimum length of DHCP packet
            throw new Error('Received data is too short');
        }
        const sb = new seqbuffer_1.SeqBuffer(buf);
        // RFC 2131
        this.op = sb.getUInt8(); // op code = 1=request; 2=reply
        this.htype = sb.getUInt8(); // hardware addr type = 1 for 10mb ethernet
        this.hlen = sb.getUInt8(); // hardware addr length = 6 for 10mb ethernet
        this.hops = sb.getUInt8(); // relay hop count
        this.xid = sb.getUInt32(); // session id; initialized by client
        this.secs = sb.getUInt16(); // seconds since client began address acquistion
        this.flags = sb.getUInt16(); // 
        this.ciaddr = sb.getIP(); // client IP when BOUND; RENEW; REBINDING state
        this.yiaddr = sb.getIP(); // 'your' client IP
        this.siaddr = sb.getIP(); // next server to use in boostrap; returned in OFFER & ACK
        this.giaddr = sb.getIP(); // gateway/relay agent IP
        this.chaddr = sb.getMAC(this.htype, this.hlen); // client hardware address
        this.sname = sb.getUTF8(64); // server host name
        this.file = sb.getUTF8(128); // boot file name
        this.magicCookie = sb.getUInt32(); // contains 99; 130, 83, 99
        this.options = sb.getOptions();
    }
}
exports.DhcpRequest = DhcpRequest;
//# sourceMappingURL=request.js.map