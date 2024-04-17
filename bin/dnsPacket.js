"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DnsPacket = void 0;
class DnsPacket {
    constructor(request) {
        this.questions = [];
        this.answers = [];
        this.authorities = [];
        this.additionals = [];
        this._index = 0;
        let obj = parseHeader(request);
        this.header = obj.h;
        for (let i = 0; i < this.header.qdcount; i++) {
            obj = parseQuestion(request, obj.i);
            this.questions.push(obj.q);
        }
        for (let i = 0; i < this.header.ancount; i++) {
            obj = parseResource(request, obj.i);
            this.answers.push(obj.r);
        }
        for (let i = 0; i < this.header.nscount; i++) {
            obj = parseResource(request, obj.i);
            this.authorities.push(obj.r);
        }
        for (let i = 0; i < this.header.arcount; i++) {
            obj = parseResource(request, obj.i);
            this.additionals.push(obj.r);
        }
    }
    get UID() {
        return `${this.questions[0].qclass}:${this.questions[0].qname}:${this.questions[0].qtype}`;
    }
}
exports.DnsPacket = DnsPacket;
function parseHeader(request) {
    return {
        h: {
            id: parseInt(request[0].toString() + request[1].toString()),
            flags: parseInt(request[2].toString() + request[3].toString()),
            qdcount: parseInt(request[4].toString() + request[5].toString()),
            ancount: parseInt(request[6].toString() + request[7].toString()),
            nscount: parseInt(request[8].toString() + request[9].toString()),
            arcount: parseInt(request[10].toString() + request[11].toString())
        },
        i: 12
    };
}
function parseQuestion(request, index) {
    let { i: updatedIndex, d: domainName } = getDomainName(request, index);
    index = updatedIndex;
    return {
        q: {
            qname: domainName.substring(0, domainName.length - 1),
            qtype: parseInt(request[index].toString() + request[index + 1].toString()),
            qclass: parseInt(request[index + 2].toString() + request[index + 3].toString())
        },
        i: index + 4
    };
}
function parseResource(request, index) {
    let { i: updatedIndex, d: domainName } = getDomainName(request, index);
    index = updatedIndex;
    let resource = {
        name: domainName.substring(0, domainName.length - 1),
        type: parseInt(request[index].toString() + request[index + 1].toString()),
        class: parseInt(request[index + 2].toString() + request[index + 3].toString()),
        ttl: parseInt(request[index + 4].toString() + request[index + 5].toString() + request[index + 6].toString() + request[index + 7].toString()),
        rdlength: parseInt(request[index + 8].toString() + request[index + 9].toString()),
        rdata: ""
    };
    resource.rdata = String.fromCharCode(...request.slice(index + 10, index + 10 + resource.rdlength));
    return {
        r: resource,
        i: index + 10 + resource.rdlength
    };
}
function getDomainName(request, index) {
    let domainName = "";
    if ((request[index] & 0xC0) === 0xC0) { //handle message compression
        let { i: _, d: domainName } = getDomainName(request, request[index + 1]);
        index += 2;
        return {
            i: index,
            d: domainName
        };
    }
    while (request[index] !== 0) {
        const labelLength = request[index];
        index++;
        let label = '';
        for (let i = 0; i < labelLength; i++) {
            label += String.fromCharCode(request[index]);
            index++;
        }
        domainName += label + '.';
    }
    index++;
    return {
        i: index,
        d: domainName
    };
}
//# sourceMappingURL=dnsPacket.js.map