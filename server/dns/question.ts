import { HasKey } from "./cache";
import { DomainName } from "./domainName";


export class Question implements HasKey {
    qclass: number;
    qtype: number;
    domainName: DomainName;
    constructor(domainName: DomainName, qtype: number, qclass: number) {
        this.domainName = domainName;
        this.qtype = qtype;
        this.qclass = qclass;
    }

    get cacheKey(): string {
        return `${this.qclass}:${this.name}:${this.qtype}`;
    }

    get name() { return this.domainName.name }

    static fromBuffer(buf: Buffer, index: number): {q: Question, i: number} {
        let obj = DomainName.fromBuffer(buf, index);
        index = obj.i;
        let qtype = buf.readUInt16BE(index);
        let qclass = buf.readUInt16BE(index+2);
        return {
            q: new Question(obj.d, qtype, qclass),
            i: index + 4
        }
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

    static fromObject(obj: any): Question {
        return new Question(DomainName.fromObject(obj.domainName), obj.qtype, obj.qclass);
    }
}