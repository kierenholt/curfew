
export class Helpers {

    static removeAllFromArray<T>(item: T, arr: T[]): T[] {
        let ret: T[] = [];
        for (let member of arr) {
            if (item != member) {
                ret.push(member);
            }
        }
        return ret;
    }

    static distinct<T>(arr: T[]) {
        let ret = [];
        for (let item of arr) {
            if (ret.indexOf(item) === -1) {
                ret.push(item)
            }
        }
        return ret;
    }

    static sum(arr: number[]) {
        return arr.reduce((partialSum: any, a: any) => partialSum + a, 0);
    }

    static writeIP(IP: string, buf: Buffer, w: number) {
        for (let n of IP.split('.')) {
            buf[w] = parseInt(n);
            w++;
        }
    }

    static readIP(buf: Buffer, r: number): string {
        return `${buf[r]}.${buf[r + 1]}.${buf[r + 2]}.${buf[r + 3]}`
    }

    static IPAsBuffer(IP: string): Buffer {
        let buf = Buffer.alloc(4);
        Helpers.writeIP(IP, buf, 0);
        return buf;
    }

    static Int32AsBuffer(n: number): Buffer {
        let buf = Buffer.alloc(4);
        buf.writeUInt32BE(n, 0);
        return buf;
    }

    static writeMAC(MAC: string, buf: Buffer, w: number) {
        for (let n of MAC.split(':')) {
            buf[w] = parseInt(n, 16);
            w++;
        }
    }


    static readAsHexString(buf: Buffer): string {
        let spl = buf.toString('hex');
        let ret: string[] = new Array(buf.length).fill("");
        for (let i = 0; i < spl.length; i++) {
            ret[Math.floor(i / 2)] += spl[i];
        }
        return ret.join(" ");
    }

    static readMAC(buf: Buffer, r: number): string {
        let spl = buf.subarray(r, r + 6).toString('hex');
        let ret: string[] = ["", "", "", "", "", ""];
        for (let i = 0; i < spl.length; i++) {
            ret[Math.floor(i / 2)] += spl[i];
        }
        return ret.join(":");
    }

    static chooseRandom(arr: string[]) {
        if (arr.length === 0) throw new Error("zero length array");
        let index = Math.floor(Math.random() * arr.length);
        return arr[index];
    }

    static randomInt(limit: number) {
        return Math.floor(Math.random() * (limit + 1));
    }

    static difference(arr: any, notArr: any) {
        let ret = [];
        for (let a of arr) {
            if (notArr.indexOf(a) === -1) ret.push(a);
        }
        return ret;
    }

    static replaceAll(within: string, char: string, neww: string) {
        return this.replace(within, char, neww, 0);
    }

    static replace(within: string, char: string, neww: string, i: number): string {
        if (i === within.length) return "";
        if (within[i] === char) {
            return neww + this.replace(within, char, neww, i + 1);
        }
        else {
            return within[i] + this.replace(within, char, neww, i + 1);
        }
    }

    static addMinutesToDate(d: Date, mins: number) {
        return new Date(d.valueOf() + mins * 60 * 1000);
    }

    static get<T>(url: string): Promise<T> {
        return fetch(url)
            .then((req: Response) => req.json())
    }

    static post(url: string, data: any): Promise<boolean> {
        return fetch(url, {
            method: "post", body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
        })
            .then((req: Response) => req.json())
    }

    static put<T>(url: string, data: any): Promise<T> {
        return fetch(url, {
            method: "put", body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
        })
            .then((req: Response) => req.json())
    }

    static delete(url: string): Promise<number> {
        return fetch(url, {
            method: "delete",
            headers: { 'Content-Type': 'application/json' },
        })
            .then((req: Response) => req.json())
    }

    static MACtoDeviceId(mac: string): string {
        return this.replaceAll(mac, ":", "");
    }

    static DeviceIdtoMAC(id: string): string {
        let ret = "";
        for (let i = 0; i < id.length; i++) {
            ret += id[i];
            if (i % 2 === 1 && i !== id.length - 1) ret += ":"
        }
        return ret;
    }

    static range(start: number, end: number) {
        let ret = [];
        if (end < start) {
            for (let i = start; i > end; i -= 1) {
                ret.push(i);
            }
        }
        else {
            for (let i = start; i < end; i += 1) {
                ret.push(i);
            }
        }
        return ret;
    }

    static delay(ms: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            setTimeout(resolve, ms);
        });
    }

    static createNonce(): number {
        return Math.ceil(Math.random() * 100000);
    }

    static pushIfNotExists<T>(item: T, arr: T[]) {
        let exists = arr.indexOf(item) != -1;
        if (!exists) {
            arr.push(item);
        }
    }
}
