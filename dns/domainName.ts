

export class DomainName {
    name: string;

    constructor(name: string) {
        this.name = name;
    }

    static fromBuffer(buf: Buffer, i: number): {d: DomainName, i: number} {
        let obj = getDomainName(buf, i);
        return { d: new DomainName(obj.d), i: obj.i };
    }

    writeToBuffer(buf: Buffer, i: number): number {
        this.name.split(".").forEach(s => {
            //length
            i = buf.writeInt8(s.length, i);
            //text
            i += buf.write(s, i, 'utf8');
        });
        return i+1;
    }

    equals(s: DomainName) {
        return this.name == s.name;
    }

    get byteLength(): number {
        return this.name.length+2;
    }
}


export function getDomainName(buf: Buffer, index: number): {i: number, d: string} {
    let domainName = "";
    if((buf[index] & 0xC0) === 0xC0) { //handle message compression
        let {i: _, d: domainName} = getDomainName(buf, buf[index+1]);
        index+=2;
        return {
            i: index, 
            d: domainName
        };
    }
    let labelLength = buf.readInt8(index);
    index++;
    domainName += buf.subarray(index, index + labelLength).toString('utf8');
    index+=labelLength;
    while (buf.readInt8(index) !== 0) {
        domainName += ".";
        labelLength = buf.readInt8(index);
        index++;
        domainName += buf.subarray(index, index + labelLength).toString('utf8');
        index+=labelLength;
    }

    return {
        i: index+1,
        d: domainName
    }
}
