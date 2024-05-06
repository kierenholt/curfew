import { HasKey } from "./cache";
import { DomainName } from "./domainName";
import { Question } from "./question";

export class Answer implements HasKey {
    domainName: DomainName;
    type: number;
    aclass: number;
    ttl: number;
    rdlength: number;
    adata: Buffer;

    //https://en.wikipedia.org/wiki/List_of_DNS_record_types
    static NULL_IP_v4 = [240,0,0,0];
    static NULL_IP_v6 = [100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; //https://en.wikipedia.org/wiki/IPv6_address#Special_addresses

    
    constructor(domainName: DomainName,
        type: number,
        aclass: number,
        ttl: number,
        rdlength: number,
        adata: Buffer) {
        this.domainName = domainName;
        this.type = type;
        this.aclass = aclass;
        this.ttl = ttl;
        this.rdlength = rdlength;
        this.adata = adata;
    }

    get cacheKey(): string {
        return `${this.aclass}:${this.name}:${this.type}`;
    }

    get name() { return this.domainName.name; }

    static fromBuffer(buf: Buffer, i: number): {a: Answer, i: number} {
        let obj = DomainName.fromBuffer(buf, i);
        i = obj.i;
        //let domainName = domainName.substring(0, domainName.length - 1);
        let type = buf.readUInt16BE(i);
        let aclass = buf.readUInt16BE(i+2);
        let ttl = buf.readUInt32BE(i+4);
        let rdlength = buf.readUInt16BE(i+8);
        let rdata = rdlength ? buf.subarray(i + 10, i + 10 + rdlength) : Buffer.from([]);
        return {
            a: new Answer(obj.d, type, aclass, ttl, rdlength, rdata), 
            i: i + 10 + rdlength
        };
    };
    
    writeToBuffer(buf: Buffer, i: number, cache: any): number {
        i = this.domainName.writeToBuffer(buf, i, cache);
        i = buf.writeInt16BE(this.type, i);
        i = buf.writeInt16BE(this.aclass, i);
        i = buf.writeInt32BE(this.ttl, i);
        i = buf.writeInt16BE(this.rdlength, i);
        i += this.adata.copy(buf, i);
        return i;
    }

    equals(a: Answer): boolean {
        return this.aclass == a.aclass &&
            this.domainName.equals(a.domainName) &&
            this.adata.equals(a.adata) &&
            this.rdlength == a.rdlength &&
            this.ttl == a.ttl &&
            this.type == a.type;
    }

    static fromObject(obj: any): Answer {
        return new Answer(DomainName.fromObject(obj.domainName), obj.type, obj.aclass, obj.ttl, obj.rdlength, obj.adata);
    }

    static fromQuestion(q: Question) {
        if (q.qtype != 28) {
            return new Answer(q.domainName, q.qtype, q.qclass, 30, 4, Buffer.from(Answer.NULL_IP_v4)); 
        }
        else { //AAAA is ipv6
            return new Answer(q.domainName, q.qtype, q.qclass, 30, 4, Buffer.from(Answer.NULL_IP_v6));
        }
    }
}