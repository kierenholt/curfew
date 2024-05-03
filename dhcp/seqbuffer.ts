import { Options } from "./options";

export interface IRequest {
    op: any;
    htype: any;
    hlen: any;
    hops: any;
    xid: number;
    secs: number;
    flags: number;
    ciaddr: any;
    yiaddr: any;
    siaddr: any;
    giaddr: any;
    chaddr: any;
    sname: any;
    file: any;
    options: any;
}

export class SeqBuffer {
    _data: Buffer;
    _r: number = 0;
    _w: number = 0;

    constructor(buf?: Buffer, len: number = 1500) {
        this._data = buf || Buffer.alloc(len); // alloc() fills the buffer with '0'
    }

    static fromRequest(req: IRequest): SeqBuffer {
        const sb = new SeqBuffer();

        sb.addUInt8(req.op);
        sb.addUInt8(req.htype);
        sb.addUInt8(req.hlen);
        sb.addUInt8(req.hops);
        sb.addUInt32(req.xid);
        sb.addUInt16(req.secs);
        sb.addUInt16(req.flags);
        sb.addIP(req.ciaddr);
        sb.addIP(req.yiaddr);
        sb.addIP(req.siaddr);
        sb.addIP(req.giaddr);
        sb.addMac(req.chaddr);
        sb.addUTF8Pad(req.sname, 64);
        sb.addUTF8Pad(req.file, 128);
        sb.addUInt32(0x63825363);
        sb.addOptions(req.options);

        sb.addUInt8(255); // Mark end

        return sb;
    }

    addUInt8(val: any) {
        this._w = this._data.writeUInt8(val, this._w);
    }

    getUInt8() {
        return this._data.readUInt8(this._r++);
    }

    addInt8(val: number) {
        this._w = this._data.writeInt8(val, this._w);
    }

    getInt8() {
        return this._data.readInt8(this._r++);
    }

    addUInt16(val: number) {
        this._w = this._data.writeUInt16BE(val, this._w);
    }

    getUInt16() {
        return this._data.readUInt16BE((this._r += 2) - 2);
    }

    addInt16(val: number) {
        this._w = this._data.writeInt16BE(val, this._w);
    }

    getInt16() {
        return this._data.readInt16BE((this._r += 2) - 2);
    }

    addUInt32(val: number) {
        this._w = this._data.writeUInt32BE(val, this._w);
    }

    getUInt32() {
        return this._data.readUInt32BE((this._r += 4) - 4);
    }

    addInt32(val: number) {
        this._w = this._data.writeInt32BE(val, this._w);
    }

    getInt32() {
        return this._data.readInt32BE((this._r += 4) - 4);
    }

    addUTF8(val: string) {
        this._w += this._data.write(val, this._w, 'utf8');
    }

    addUTF8Pad(val: any, fixLen: number) {

        let len = Buffer.from(val, 'utf8').length;
        for (let n = 0; len > fixLen; n++) {
            val = val.slice(0, fixLen - n); // Truncate as long as character length is > fixLen
            len = Buffer.from(val, 'utf8').length;
        }

        this._data.fill(0, this._w, this._w + fixLen);
        this._data.write(val, this._w, 'utf8');
        this._w += fixLen;
    }

    getUTF8(len: number) {
        return trimZero(this._data.toString('utf8', this._r, this._r += len));
    }

    addASCII(val: string) {
        this._w += this._data.write(val, this._w, 'ascii');
    }

    addASCIIPad(val: string, fixLen: number) {
        this._data.fill(0, this._w, this._w + fixLen);
        this._data.write(val.slice(0, fixLen), this._w, 'ascii');
        this._w += fixLen;
    }

    getASCII(len: number) {
        return trimZero(this._data.toString('ascii', this._r, this._r += len));
    }

    addIP(ip: any) {
        const self = this;
        const octs = ip.split('.');

        if (octs.length !== 4) {
            throw new Error('Invalid IP address ' + ip);
        }

        for (let val of octs) {

            val = parseInt(val, 10);
            if (0 <= val && val < 256) {
                self.addUInt8(val);
            } else {
                throw new Error('Invalid IP address ' + ip);
            }
        }
    }

    getIP() {

        return this.getUInt8() +
            '.' + this.getUInt8() +
            '.' + this.getUInt8() +
            '.' + this.getUInt8();
    }

    addIPs(ips: any) {

        if (ips instanceof Array) {
            for (let ip of ips) {
                this.addIP(ip);
            }
        } else {
            this.addIP(ips);
        }
    }

    getIPs(len: number) {
        const ret = [];
        for (let i = 0; i < len; i += 4) {
            ret.push(this.getIP());
        }
        return ret;
    }

    addMac(mac: any) {

        const octs = mac.split(/[-:]/);

        if (octs.length !== 6) {
            throw new Error('Invalid Mac address ' + mac);
        }

        for (let val of octs) {
            val = parseInt(val, 16);
            if (0 <= val && val < 256) {
                this.addUInt8(val);
            } else {
                throw new Error('Invalid Mac address ' + mac);
            }
        }

        // Add 10 more byte to pad 16 byte
        this.addUInt32(0);
        this.addUInt32(0);
        this.addUInt16(0);
    }

    getMAC(htype: number, hlen: number) {

        const mac = this._data.toString('hex', this._r, this._r += hlen);

        if (htype !== 1 || hlen !== 6) {
            throw new Error('Invalid hardware address (len=' + hlen + ', type=' + htype + ')');
        }

        this._r += 10; // + 10 since field is 16 byte and only 6 are used for htype=1
        return mac.toUpperCase().match(/../g)?.join('-');
    }

    addBool() {
        /* void */
    }

    getBool() {
        return true;
    }

    addOptions(opts: any) {

        for (let i in opts) {

            if (opts.hasOwnProperty(i)) {

                const opt = Options.opts[i];
                let len = 0;
                let val = opts[i];

                if (val === null) {
                    continue;
                }

                switch (opt.type) {
                    case 'UInt8':
                    case 'Int8':
                        len = 1;
                        break;
                    case 'UInt16':
                    case 'Int16':
                        len = 2;
                        break;
                    case 'UInt32':
                    case 'Int32':
                    case 'IP':
                        len = 4;
                        break;
                    case 'IPs':
                        len = val instanceof Array ? 4 * val.length : 4;
                        break;
                    case 'ASCII':
                        len = val.length;
                        if (len === 0)
                            continue; // Min length has to be 1
                        if (len > 255) {
                            console.error(val + ' too long, truncating...');
                            val = val.slice(0, 255);
                            len = 255;
                        }
                        break;
                    case 'UTF8':
                        len = Buffer.from(val, 'utf8').length;
                        if (len === 0)
                            continue; // Min length has to be 1
                        for (let n = 0; len > 255; n++) {
                            val = val.slice(0, 255 - n); // Truncate as long as character length is > 255
                            len = Buffer.from(val, 'utf8').length;
                        }
                        break;
                    case 'Bool':
                        if (!(val === true || val === 1 || val === '1' || val === 'true' || val === 'TRUE' || val === 'True'))
                            continue;
                        // Length must be zero, so nothing to do here
                        break;
                    case 'UInt8s':
                        len = val instanceof Array ? val.length : 1;
                        break;
                    case 'UInt16s':
                        len = val instanceof Array ? 2 * val.length : 2;
                        break;
                    default:
                        console.error('No such type ' + JSON.stringify(opt));
                        //throw new Error('No such type ' + opt.type);
                }

                // Write code
                this.addUInt8(i);

                // Write length
                this.addUInt8(len);

                // Write actual data
                (this as any)['add' + opt.type](val);
            }
        }
    }

    getOptions() {

        const options: any = {};
        const buf = this._data;

        while (this._r < buf.length) {

            let optIndex = this.getUInt8();

            if (optIndex === 0xff) { // End type
                break;
            } else if (optIndex === 0x00) { // Pad type
                this._r++; // NOP
            } else {

                let len = this.getUInt8();

                if (optIndex in Options.opts) {
                    options[optIndex] = (this as any)['get' + Options.opts[optIndex].type](len);
                }
                else {
                    this._r += len;
                    console.error('Option ' + optIndex + ' not known');
                    //throw("option not known");
                }
            }
        }
        return options;
    }

    addUInt8s(arr: any) {

        if (arr instanceof Array) {
            for (let i = 0; i < arr.length; i++) {
                this.addUInt8(arr[i]);
            }
        } else {
            this.addUInt8(arr);
        }
    }

    getUInt8s(len: number) {
        const ret = [];
        for (let i = 0; i < len; i++) {
            ret.push(this.getUInt8());
        }
        return ret;
    }

    addUInt16s(arr: any) {

        if (arr instanceof Array) {
            for (let i = 0; i < arr.length; i++) {
                this.addUInt16(arr[i]);
            }
        } else {
            this.addUInt16(arr);
        }
    }

    getUInt16s(len: number) {
        const ret = [];
        for (let i = 0; i < len; i += 2) {
            ret.push(this.getUInt16());
        }
        return ret;
    }

    getHex(len: number) {
        return this._data.toString('hex', this._r, this._r += len);
    }
}


function trimZero(str: string) {
    const pos = str.indexOf('\x00');

    return pos === -1 ? str : str.substr(0, pos);
}