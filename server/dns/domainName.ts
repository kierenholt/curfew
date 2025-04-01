import { Helpers } from "../utility/helpers";

export class DomainName {
    name: string;

    constructor(name: string) {
        this.name = name;
    }

    static fromBuffer(buf: Buffer, i: number): [DomainName, number] {
        let s;
        [i, s] = getDomainString(buf, i);
        s = Helpers.trim(s, ".");
        return [new DomainName(s), i];
    }

    writeToBuffer(buf: Buffer, w: number, cache: any): number {
        let words = this.name.split(".");
        for (let i = 0, s; s = words[i]; i++) {
            let restOfName = words.slice(i).join(".");
            if (restOfName in cache) {
                let pointer = 0xC000 | cache[restOfName];
                w = buf.writeUInt16BE(pointer, w);
                return w;
            }
            else {
                //add to cache
                cache[restOfName] = w;
                //length
                w = buf.writeUInt8(s.length, w);
                //text
                w += buf.write(s, w, 'ascii');
            }
        }
        return w + 1;
    }

    equals(s: DomainName) {
        return this.name == s.name;
    }

    static fromObject(obj: any): DomainName {
        return new DomainName(obj.name);
    }
}


export function getDomainString(buf: Buffer,
    index: number): [number, string] {

    if (isNaN(index)) {
        throw ("index cannot be NaN");
    }

    if ((buf[index] & 0xC0) === 0xC0) { //handle message compression
        let offset = 0x3fff & buf.readUInt16BE(index);
        let [i, next] = getDomainString(buf, offset);
        return [index + 2, next];
    }

    let labelLength = buf[index];
    if (labelLength == 0) {
        return [index + 1, ""]
    }

    let domainName = "." + buf.subarray(index + 1, index + labelLength + 1).toString('ascii');
    let [i, next] = getDomainString(buf, index + labelLength + 1);
    return [i, domainName + next];
}
