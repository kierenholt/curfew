export interface DnsFlag {
    domain: string;
    hidden: boolean;
    flagged: boolean;
}

export interface DnsResponse {
    domain: string;
    ip: string;
    createdOn: number;
    requesterIp: string;
}

export type DnsResponseWithFlag = DnsResponse & DnsFlag;