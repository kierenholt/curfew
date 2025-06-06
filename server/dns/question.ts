import { HasKey } from "./cache";
import { DomainName } from "./domainName";


export enum RecordType {
    A = 1, AAAA = 28, CNAME = 5, DNAME = 39, MX = 15, NS = 2, 
    PTR = 12, TXT = 16, HTTPS = 65,
}

export class Question implements HasKey {
    qclass: number;
    
    qtype: RecordType; //https://en.wikipedia.org/wiki/List_of_DNS_record_types

    domainName: DomainName;
    constructor(domainName: DomainName, qtype: RecordType, qclass: number) {
        this.domainName = domainName;
        this.qtype = qtype; // A, AAAA etc.
        this.qclass = qclass;
    }

    get cacheKey(): string {
        return `${this.qclass}:${this.name}:${this.qtype}`;
    }

    get name() { return this.domainName.name }

    static fromBuffer(buf: Buffer, i: number): [Question, number] {
        let domainName;
        [domainName, i] = DomainName.fromBuffer(buf, i);
        let qtype = buf.readUInt16BE(i);
        let qclass = buf.readUInt16BE(i+2);
        return [ new Question(domainName, qtype, qclass), i + 4]
    }

    writeToBuffer(buf: Buffer, i: number, cache: any): number {
        i = this.domainName.writeToBuffer(buf, i, cache);
        i = buf.writeUInt16BE(this.qtype, i);
        i = buf.writeUInt16BE(this.qclass, i);
        return i;
    }

    equals(q: Question): boolean {
        return this.qclass == q.qclass &&
            this.domainName.equals(q.domainName) &&
            this.qtype == q.qtype;
    }
}