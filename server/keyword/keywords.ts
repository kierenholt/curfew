import { DnsResponseDb } from "../dns/dnsResponseDb";
import { Helpers } from "../helpers";
import { KeywordDb } from "./keywordDb";

export class Keywords {
    static async isDomainBlocked(domain: string) {
        let terms = await KeywordDb.getAllActive();
        return terms.some(t => t.blocksDomain(domain))
    }

    static async getBlockedIPs(): Promise<string[]> {
        let ret: string[] = [];
        let terms = await KeywordDb.getAllActive();
        for (let t of terms) {
            for (let n of t.needles) {
                let matchingDomains = await DnsResponseDb.getDomainsContaining(n);
                ret.push(...matchingDomains.map(d => d.ip));
            }
        }
        return Helpers.removeDuplicates(ret);
    }
}