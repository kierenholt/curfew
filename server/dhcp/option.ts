

export class Option {
    code: number;
    length: number;
    rdata: Buffer;

    constructor(code: number, length: number, rdata: Buffer) {
        this.code = code;
        this.length = length;
        this.rdata = rdata;
    }

    static fromBuffer(buf: Buffer, r: number): {r: number, o: Option} {
        let code = buf[r];
        if (code == 0xff) {
            return {r: r+1, o: new Option(255, 0, Buffer.from([]))};
        }
        let length = buf[r+1];
        let rdata = buf.subarray(r+2, r+2+length);
        return {r: r+2+length, o: new Option(code, length, rdata)};
    }

    writeToBuffer(buf: Buffer, w: number): number {
        buf[w] = this.code;
        if (this.code == 255) {
            return w+1;
        }
        buf[w+1] = this.length;
        this.rdata.copy(buf, w+2);
        return w + 2 + this.length;
    }
}