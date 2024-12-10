import { DnsResponseDb } from "../dns/dnsResponseDb";
import { SearchTermDb } from "./searchTermDb";

export class ActiveSearchTerms {
    static terms: SearchTermDb[] = [];

    static async init() {
        this.terms = await SearchTermDb.getAllActive();
    }

    static isDomainBlocked(domain: string) {
        return this.terms.some(t => t.blocksDomain(domain))
    }

    static async getBlockedIPs(): Promise<string[]> {
        let ret: string[] = [];
        for (let t of this.terms) {
            for (let n of t.getNeedles()) {
                let matchingDomains = await DnsResponseDb.getDomainsContaining(n);
                ret.push(...matchingDomains.map(d => d.ip));
            }
        }
        return ret;
    }
}