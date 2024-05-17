
export class DomainName {
    name: string;

    constructor(name: string) {
        this.name = name;
    }

    static fromBuffer(buf: Buffer, i: number): {d: DomainName, i: number} {
        let obj = getDomainName(buf, i, true);
        //console.log(obj.d);
        return { d: new DomainName(obj.d), i: obj.i };
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
                w += buf.write(s, w, 'utf8');
            }
        }
        return w+1;
    }

    equals(s: DomainName) {
        return this.name == s.name;
    }

    static fromObject(obj: any): DomainName {
        return new DomainName(obj.name);
    }
}


export function getDomainName(buf: Buffer,
    index: number,
    first: boolean = false): {i: number, d: string} {

    if (isNaN(index)) {
        throw("index cannot be NaN");
    }

    let dot = first ? "" : ".";

    if((buf[index] & 0xC0) === 0xC0) { //handle message compression
        let offset = 0x3fff & buf.readUInt16BE(index);
        let next = getDomainName(buf, offset, first);
        return {
            i: index + 2, 
            d: next.d
        };
    }
    let labelLength = buf[index];
    if (labelLength == 0)
    {
        return {
            i: index+1,
            d: ""
        }
    }
    
    let domainName = buf.subarray(index + 1, index + labelLength + 1).toString('utf8');
    let next = getDomainName(buf, index + labelLength + 1);
    return {
        i: next.i,
        d: dot + domainName + next.d
    }; 


}
