
export class DnsResponse {
    domain: string;
    ip: string;
    createdOn: number;
    requesterIp: string;

    constructor(domain: string, ip: string, createdOn: number, mac: string) {
        this.domain = domain;
        this.ip = ip;
        this.createdOn = createdOn;
        this.requesterIp = mac;
    }
}