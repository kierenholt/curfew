import { DnsResponseDb } from "../dnsResponse/dnsResponseDb";
import { Helpers } from "../helpers";
import { KeywordDb } from "./keywordDb";

export class Keywords {
    static async isDomainBlocked(domain: string) {
        let terms = await KeywordDb.getAllActive();
        return terms.some(t => t.blocksDomain(domain))
    }

    static async getBlockedIPsAndPorts(): Promise<[string[], number[]]> {
        let ips: string[] = [];
        let ports: number[] = [];
        let terms = await KeywordDb.getAllActive();
        for (let t of terms) {
            for (let n of t.needles) {
                let matchingDomains = await DnsResponseDb.getDomainsContaining(n);
                ips.push(...matchingDomains.map(d => d.ip));
            }
            ports.push(...t.portsArray);
        }
        return [Helpers.removeDuplicates(ips), Helpers.removeDuplicates(ports)];
    }
}