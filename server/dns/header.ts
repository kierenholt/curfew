
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
        let id = buf.readUInt16BE(i+=2);
        let flags = buf.readUInt16BE(i+=2);
        let qdcount = buf.readUInt16BE(i+=2);
        let ancount = buf.readUInt16BE(i+=2);
        let nscount = buf.readUInt16BE(i+=2);
        let arcount = buf.readUInt16BE(i+=2);
        return { h: new Header(id, flags, qdcount, ancount, nscount, arcount), i: i+2 };
    }

    writeToBuffer(buf: Buffer, i: number): number {
        i = buf.writeUInt16BE(this.id, i);
        i = buf.writeUInt16BE(this.flags, i);
        i = buf.writeUInt16BE(this.qdcount, i);
        i = buf.writeUInt16BE(this.ancount, i);
        i = buf.writeUInt16BE(this.nscount, i);
        i = buf.writeUInt16BE(this.arcount, i);
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
    
    static fromObject(obj: any): Header {
        return new Header(obj.id, obj.flags, obj.qdcount, obj.ancount, obj.nscount, obj.arcount);
    }

    get isResponse(): boolean {
        return (this.flags & 0x8000) == 0x8000;
    }

    set isResponse(value: boolean) {
        if (value) {
            this.flags = this.flags | 0x8000;
        }
        else {
            this.flags = this.flags &  (~0x8000);
        }
    }

    set nameDoesNotExist(value: boolean) {
        if (value) {
            this.flags = this.flags | 3;
            this.flags = this.flags | (1 << 10);
        }
        else {
            this.flags = this.flags & (~16);
            this.flags = this.flags & (~(1 << 10));
        }
    }

    set isAuthority(value: boolean) {
        if (value) {
            this.flags = this.flags | (1 << 10);
        }
        else {
            this.flags = this.flags & (~(1 << 10));
        }
    }
}
