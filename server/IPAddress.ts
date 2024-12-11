

export class IPAddress {
    buffer: Buffer;
    constructor(bytes: number[]) {
        this.buffer = Buffer.alloc(4);
        this.buffer[0] = bytes[0];
        this.buffer[1] = bytes[1];
        this.buffer[2] = bytes[2];
        this.buffer[3] = bytes[3];
    }

    toHex() {
        return this.buffer.toString("hex");
    }

    toString() {
        return [
            this.buffer[0].toString(),
            this.buffer[1].toString(),
            this.buffer[2].toString(),
            this.buffer[3].toString()
        ].join(".");
    }

    static fromHex(s: string): IPAddress {
        if (s.length < 8) throw ("incorrect length " + s);
        let bytes = [
            parseInt(s.substring(0, 2), 16),
            parseInt(s.substring(2, 4), 16),
            parseInt(s.substring(4, 6), 16),
            parseInt(s.substring(6, 8), 16),
        ];
        return new IPAddress(bytes);
    }

    static fromString(s: string): IPAddress {
        let bytes = s.split('.').map(n => parseInt(n));
        return new IPAddress(bytes);
    }

    equals(other: IPAddress) {
        return other.buffer[0] == this.buffer[0] &&
            other.buffer[1] == this.buffer[1] &&
            other.buffer[2] == this.buffer[2] &&
            other.buffer[3] == this.buffer[3];
    }
}