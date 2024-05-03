import { HasUID } from "./dnsPacket";

export class Cache {
    cached: any = {};

    get(request: HasUID): Buffer {
        return this.cached[request.cacheUID];
    }

    upsert(request: HasUID, response: Buffer) {
        this.cached[request.cacheUID] = response;
    }
}