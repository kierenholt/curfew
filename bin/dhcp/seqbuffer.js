"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeqBuffer = void 0;
const options_1 = require("./options");
class SeqBuffer {
    constructor(buf, len = 1500) {
        this._r = 0;
        this._w = 0;
        this._data = buf || Buffer.alloc(len); // alloc() fills the buffer with '0'
    }
    static fromRequest(req) {
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
    addUInt8(val) {
        this._w = this._data.writeUInt8(val, this._w);
    }
    getUInt8() {
        return this._data.readUInt8(this._r++);
    }
    addInt8(val) {
        this._w = this._data.writeInt8(val, this._w);
    }
    getInt8() {
        return this._data.readInt8(this._r++);
    }
    addUInt16(val) {
        this._w = this._data.writeUInt16BE(val, this._w);
    }
    getUInt16() {
        return this._data.readUInt16BE((this._r += 2) - 2);
    }
    addInt16(val) {
        this._w = this._data.writeInt16BE(val, this._w);
    }
    getInt16() {
        return this._data.readInt16BE((this._r += 2) - 2);
    }
    addUInt32(val) {
        this._w = this._data.writeUInt32BE(val, this._w);
    }
    getUInt32() {
        return this._data.readUInt32BE((this._r += 4) - 4);
    }
    addInt32(val) {
        this._w = this._data.writeInt32BE(val, this._w);
    }
    getInt32() {
        return this._data.readInt32BE((this._r += 4) - 4);
    }
    addUTF8(val) {
        this._w += this._data.write(val, this._w, 'utf8');
    }
    addUTF8Pad(val, fixLen) {
        let len = Buffer.from(val, 'utf8').length;
        for (let n = 0; len > fixLen; n++) {
            val = val.slice(0, fixLen - n); // Truncate as long as character length is > fixLen
            len = Buffer.from(val, 'utf8').length;
        }
        this._data.fill(0, this._w, this._w + fixLen);
        this._data.write(val, this._w, 'utf8');
        this._w += fixLen;
    }
    getUTF8(len) {
        return trimZero(this._data.toString('utf8', this._r, this._r += len));
    }
    addASCII(val) {
        this._w += this._data.write(val, this._w, 'ascii');
    }
    addASCIIPad(val, fixLen) {
        this._data.fill(0, this._w, this._w + fixLen);
        this._data.write(val.slice(0, fixLen), this._w, 'ascii');
        this._w += fixLen;
    }
    getASCII(len) {
        return trimZero(this._data.toString('ascii', this._r, this._r += len));
    }
    addIP(ip) {
        const self = this;
        const octs = ip.split('.');
        if (octs.length !== 4) {
            throw new Error('Invalid IP address ' + ip);
        }
        for (let val of octs) {
            val = parseInt(val, 10);
            if (0 <= val && val < 256) {
                self.addUInt8(val);
            }
            else {
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
    addIPs(ips) {
        if (ips instanceof Array) {
            for (let ip of ips) {
                this.addIP(ip);
            }
        }
        else {
            this.addIP(ips);
        }
    }
    getIPs(len) {
        const ret = [];
        for (let i = 0; i < len; i += 4) {
            ret.push(this.getIP());
        }
        return ret;
    }
    addMac(mac) {
        const octs = mac.split(/[-:]/);
        if (octs.length !== 6) {
            throw new Error('Invalid Mac address ' + mac);
        }
        for (let val of octs) {
            val = parseInt(val, 16);
            if (0 <= val && val < 256) {
                this.addUInt8(val);
            }
            else {
                throw new Error('Invalid Mac address ' + mac);
            }
        }
        // Add 10 more byte to pad 16 byte
        this.addUInt32(0);
        this.addUInt32(0);
        this.addUInt16(0);
    }
    getMAC(htype, hlen) {
        var _a;
        const mac = this._data.toString('hex', this._r, this._r += hlen);
        if (htype !== 1 || hlen !== 6) {
            throw new Error('Invalid hardware address (len=' + hlen + ', type=' + htype + ')');
        }
        this._r += 10; // + 10 since field is 16 byte and only 6 are used for htype=1
        return (_a = mac.toUpperCase().match(/../g)) === null || _a === void 0 ? void 0 : _a.join('-');
    }
    addBool() {
        /* void */
    }
    getBool() {
        return true;
    }
    addOptions(opts) {
        for (let i in opts) {
            if (opts.hasOwnProperty(i)) {
                const opt = options_1.Options.opts[i];
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
                if (opt.type == "UInt8") {
                    this.addUInt8(val);
                }
                if (opt.type == "Int8") {
                    this.addInt8(val);
                }
                if (opt.type == "UInt8s") {
                    this.addUInt8s(val);
                }
                if (opt.type == "UInt16") {
                    this.addUInt16(val);
                }
                if (opt.type == "Int16") {
                    this.addInt16(val);
                }
                if (opt.type == "UInt16s") {
                    this.addUInt16s(val);
                }
                if (opt.type == "UInt32") {
                    this.addUInt32(val);
                }
                if (opt.type == "Int32") {
                    this.addInt32(val);
                }
            }
        }
    }
    getOptions() {
        const options = {};
        const buf = this._data;
        while (this._r < buf.length) {
            let optIndex = this.getUInt8();
            if (optIndex === 0xff) { // End type
                break;
            }
            else if (optIndex === 0x00) { // Pad type
                this._r++; // NOP
            }
            else {
                let len = this.getUInt8();
                if (optIndex in options_1.Options.opts) {
                    switch (options_1.Options.opts[optIndex].type) {
                        case "Int8":
                            options[optIndex] = this.getInt8();
                            break;
                        case "Int16":
                            options[optIndex] = this.getInt16();
                            break;
                        case "Int32":
                            options[optIndex] = this.getInt32();
                            break;
                        case "UInt8":
                            options[optIndex] = this.getUInt8();
                            break;
                        case "UInt8s":
                            options[optIndex] = this.getUInt8s(len);
                            break;
                        case "UInt16":
                            options[optIndex] = this.getUInt16();
                            break;
                        case "UInt16s":
                            options[optIndex] = this.getUInt16s(len);
                            break;
                        case "UInt32":
                            options[optIndex] = this.getUInt32();
                            break;
                    }
                }
                else {
                    this._r += len;
                    console.error('Option ' + optIndex + ' not known');
                }
            }
        }
        return options;
    }
    addUInt8s(arr) {
        if (arr instanceof Array) {
            for (let i = 0; i < arr.length; i++) {
                this.addUInt8(arr[i]);
            }
        }
        else {
            this.addUInt8(arr);
        }
    }
    getUInt8s(len) {
        const ret = [];
        for (let i = 0; i < len; i++) {
            ret.push(this.getUInt8());
        }
        return ret;
    }
    addUInt16s(arr) {
        if (arr instanceof Array) {
            for (let i = 0; i < arr.length; i++) {
                this.addUInt16(arr[i]);
            }
        }
        else {
            this.addUInt16(arr);
        }
    }
    getUInt16s(len) {
        const ret = [];
        for (let i = 0; i < len; i += 2) {
            ret.push(this.getUInt16());
        }
        return ret;
    }
    getHex(len) {
        return this._data.toString('hex', this._r, this._r += len);
    }
}
exports.SeqBuffer = SeqBuffer;
function trimZero(str) {
    const pos = str.indexOf('\x00');
    return pos === -1 ? str : str.substr(0, pos);
}
//# sourceMappingURL=seqbuffer.js.map