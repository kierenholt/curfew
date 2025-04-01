import { Answer } from "./answer";
import { DnsPacket } from "./dnsPacket";

export interface HasKey {
    cacheKey: string;
}

export class Cache {
    cached: any = {};

    getAnswers(hasKey: HasKey): DnsPacket {
        return this.cached[hasKey.cacheKey];
    }

    upsert(hasKey: HasKey, packet: DnsPacket) {
        this.cached[hasKey.cacheKey] = packet;
    }
}