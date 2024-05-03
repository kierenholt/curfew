
export class Header {
        id: number;
        flags: number;
        qdcount: number;
        ancount: number;
        nscount: number;
        arcount: number;
    
    constructor(id: number, flags: number, qdcount: number, ancount: number, nscount: number, arcount: number) {
        this.id = id;
        this.flags = flags;
        this.qdcount = qdcount;
        this.ancount = ancount;
        this.nscount = nscount;
        this.arcount = arcount;
    }

    static fromBuffer(buf: Buffer, i: number): {h: Header, i: number} {
        i -= 2;
        let id = buf.readInt16BE(i+=2);
        let flags = buf.readInt16BE(i+=2);
        let qdcount = buf.readInt16BE(i+=2);
        let ancount = buf.readInt16BE(i+=2);
        let nscount = buf.readInt16BE(i+=2);
        let arcount = buf.readInt16BE(i+=2);
        return { h: new Header(id, flags, qdcount, ancount, nscount, arcount), i: i+2 };
    }

    writeToBuffer(buf: Buffer, i: number): number {
        i = buf.writeInt16BE(this.id, i);
        i = buf.writeInt16BE(this.flags, i);
        i = buf.writeInt16BE(this.qdcount, i);
        i = buf.writeInt16BE(this.ancount, i);
        i = buf.writeInt16BE(this.nscount, i);
        i = buf.writeInt16BE(this.arcount, i);
        return i;
    }

    equals(h: Header): boolean {
        return this.id == h.id &&
            this.flags == h.flags &&
            this.qdcount == h.qdcount &&
            this.ancount == h.ancount &&
            this.nscount == h.nscount &&
            this.arcount == h.arcount;
    }

    get byteLength():number { return 12; }
}
