import { Helpers } from "../utility/helpers";
import { HasKey } from "./cache";
import { DomainName } from "./domainName";
import { Question, RecordType } from "./question";

export class Answer implements HasKey {
    domainName: DomainName;
    type: RecordType;
    aclass: number;
    ttl: number;
    rdlength: number;
    adata: Buffer | DomainName;

    //https://en.wikipedia.org/wiki/List_of_DNS_record_types


    constructor(domainName: DomainName,
        type: RecordType,
        aclass: number,
        ttl: number,
        rdlength: number,
        adata: Buffer | DomainName) {
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

    static fromBuffer(buf: Buffer, i: number): [Answer, number] {
        let domainName;
        [domainName, i] = DomainName.fromBuffer(buf, i);
        //let domainName = domainName.substring(0, domainName.length - 1);
        let type = buf.readUInt16BE(i);
        let aclass = buf.readUInt16BE(i + 2);
        let ttl = buf.readUInt32BE(i + 4);
        let rdlength = buf.readUInt16BE(i + 8);
        if (type == RecordType.CNAME) {
            let cname;
            [cname, i] = DomainName.fromBuffer(buf, i + 10);
            return [ new Answer(domainName, type, aclass, ttl, rdlength, cname), i ]
        }
        else {
            let adata = rdlength ? buf.subarray(i + 10, i + 10 + rdlength) : Buffer.from([]);
            return [ new Answer(domainName, type, aclass, ttl, rdlength, adata), i + 10 + rdlength ]
        }
    };

    writeToBuffer(buf: Buffer, i: number, cache: any): number {
        i = this.domainName.writeToBuffer(buf, i, cache);
        i = buf.writeUInt16BE(this.type, i);
        i = buf.writeUInt16BE(this.aclass, i);
        i = buf.writeUInt32BE(this.ttl, i);
        i = buf.writeUInt16BE(this.rdlength, i);
        if (this.type == RecordType.CNAME) {
            i = (this.adata as DomainName).writeToBuffer(buf, i, cache);
        }
        else {
            i += (this.adata as Buffer).copy(buf, i);
        }
        return i;
    }

    equals(a: Answer): boolean {
        return this.aclass == a.aclass &&
            this.domainName.equals(a.domainName) &&
            (this.type == RecordType.CNAME ? 
                (this.adata as DomainName).equals(a.adata as DomainName) :
                (this.adata as Buffer).equals(a.adata as Buffer)) &&
            this.rdlength == a.rdlength &&
            this.ttl == a.ttl &&
            this.type == a.type;
    }

    static fromObject(obj: any): Answer {
        return new Answer(DomainName.fromObject(obj.domainName), obj.type, obj.aclass, obj.ttl, obj.rdlength, obj.adata);
    }

    static answerFromQuestion(q: Question, ip4: string, ip6: Buffer = Buffer.alloc(0)): Answer {
        if (q.qtype != 28 || ip6.length == 0) {
            return new Answer(q.domainName, q.qtype, q.qclass, 30, 4, Helpers.IPAsBuffer(ip4));
        }
        else { //AAAA is ipv6
            return new Answer(q.domainName, q.qtype, q.qclass, 30, 4, ip6);
        }
    }

    get IPAddressOrCName(): string {
        return this.type == RecordType.CNAME ?
            this.domainName.name :
            `${(this.adata as Buffer)[0]}.${(this.adata as Buffer)[1]}.${(this.adata as Buffer)[2]}.${(this.adata as Buffer)[3]}`;
    }
}