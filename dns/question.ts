import { DomainName } from "./domainName";

export class Question {
    qclass: number;
    qtype: number;
    domainName: DomainName;
    constructor(domainName: DomainName, qtype: number, qclass: number) {
        this.domainName = domainName;
        this.qtype = qtype;
        this.qclass = qclass;
    }
    get qname() { return this.domainName.name }

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

    writeToBuffer(buf: Buffer, i: number): number {
        i = this.domainName.writeToBuffer(buf, i);
        i = buf.writeInt16BE(this.qtype, i);
        i = buf.writeInt16BE(this.qclass, i);
        return i;
    }

    equals(q: Question): boolean {
        return this.qclass == q.qclass &&
            this.domainName.equals(q.domainName) &&
            this.qtype == q.qtype;
    }

    get byteLength():number {
        return this.domainName.byteLength + 4;
    }

    static fromObject(obj: any): Question {
        return new Question(DomainName.fromObject(obj.domainName), obj.qtype, obj.qclass);
    }
}