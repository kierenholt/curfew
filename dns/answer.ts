import { DomainName } from "./domainName";

export class Answer {
    domainName: DomainName;
    type: number;
    aclass: number;
    ttl: number;
    rdlength: number;
    adata: Buffer;
    
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
    get name() { return this.domainName.name; }

    get class() { return this.aclass };

    static fromBuffer(buf: Buffer, i: number): {a: Answer, i: number} {
        let obj = DomainName.fromBuffer(buf, i);
        i = obj.i;
        //let domainName = domainName.substring(0, domainName.length - 1);
        let type = buf.readUInt16BE(i);
        let aclass = buf.readUInt16BE(i+2);
        let ttl = buf.readUInt32BE(i+4);
        let rdlength = buf.readUInt16BE(i+8);
        let rdata = buf.subarray(i + 10, i + 10 + rdlength);    
        return {
            a: new Answer(obj.d, type, aclass, ttl, rdlength, rdata), 
            i: i + 10 + rdlength
        };
    };
    
    writeToBuffer(buf: Buffer, i: number): number {
        i = this.domainName.writeToBuffer(buf, i);
        i = buf.writeInt16BE(this.type, i);
        i = buf.writeInt16BE(this.aclass, i);
        i = buf.writeInt32BE(this.ttl, i);
        i = buf.writeInt16BE(this.rdlength, i);
        i += this.adata.copy(buf, i);
        return i;
    }

    equals(r: Answer): boolean {
        return this.aclass == r.class &&
            this.domainName.equals(r.domainName) &&
            this.adata == r.adata &&
            this.rdlength == r.rdlength &&
            this.ttl == r.ttl &&
            this.type == r.type;
    }

    get byteLength(): number {
        return this.domainName.byteLength + 10 + this.rdlength;
    }

    static fromObject(obj: any): Answer {
        return new Answer(DomainName.fromObject(obj.domainName), obj.type, obj.aclass, obj.ttl, obj.rdlength, obj.adata);
    }
}