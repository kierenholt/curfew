export interface IDnsResponseGrouping {
    domainName: string;
    ips: string[];
    createdOns: number[];
    flagged: boolean;
    hidden: boolean;
}