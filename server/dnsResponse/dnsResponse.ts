
export class DnsResponse {
    domain: string;
    ip: string;
    createdOn: number;
    requesterIp: string;

    constructor(domain: string, ip: string, createdOn: number, requesterIp: string) {
        this.domain = domain;
        this.ip = ip;
        this.createdOn = createdOn;
        this.requesterIp = requesterIp;
    }
}