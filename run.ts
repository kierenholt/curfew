import { DnsSocket } from "./dnsSocket";
import { DomainChecker } from "./domainChecker";

async function run() {
    let server = new DnsSocket(new DomainChecker());
    await new Promise(() => {});
}
run();