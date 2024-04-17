import { HasUID } from "./dnsPacket";

export class Cache {
    cached: any = {};

    get(request: HasUID): Buffer {
        return this.cached[request.UID];
    }

    upsert(request: HasUID, response: Buffer) {
        this.cached[request.UID] = response;
    }
}