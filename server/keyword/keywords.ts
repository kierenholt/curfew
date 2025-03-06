import { DnsResponseQuery } from "../dnsResponse/dnsResponseDb";
import { Helpers } from "../helpers";
import { KeywordQuery } from "./keywordQuery";

export class Keywords {
    static async isDomainBlocked(domain: string) {
        let terms = await KeywordQuery.getAllActive();
        return terms.some(t => t.blocksDomain(domain))
    }

    static async getBlockedIPsAndPorts(): Promise<[string[], number[]]> {
        let ips: string[] = [];
        let ports: number[] = [];
        let terms = await KeywordQuery.getAllActive();
        for (let t of terms) {
            for (let n of t.needles) {
                let matchingDomains = await DnsResponseQuery.getDomainsContaining(n);
                ips.push(...matchingDomains.map(d => d.ip));
            }
            ports.push(...t.portsArray);
        }
        return [Helpers.removeDuplicates(ips), Helpers.removeDuplicates(ports)];
    }

}