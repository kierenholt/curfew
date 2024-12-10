import { RouterFilter } from "./routerFilter";


export enum OidType {
    DHCPIsEnabled = "1.3.6.1.4.1.4115.1.20.1.1.2.2.1.9.200",
    IpVer = "1.3.6.1.4.1.4115.1.20.1.1.4.47.1.1.2",
    Direction = "1.3.6.1.4.1.4115.1.20.1.1.4.47.1.1.3",
    ProtoType = "1.3.6.1.4.1.4115.1.20.1.1.4.47.1.1.4",
    SrcRange = "1.3.6.1.4.1.4115.1.20.1.1.4.47.1.1.5",
    SrcStartAddr = "1.3.6.1.4.1.4115.1.20.1.1.4.47.1.1.6",
    SrcEndAddr = "1.3.6.1.4.1.4115.1.20.1.1.4.47.1.1.7",
    SrcPrefixLen = "1.3.6.1.4.1.4115.1.20.1.1.4.47.1.1.8",
    DstRange = "1.3.6.1.4.1.4115.1.20.1.1.4.47.1.1.9",
    DstStartAddr = "1.3.6.1.4.1.4115.1.20.1.1.4.47.1.1.10",
    DstEndAddr = "1.3.6.1.4.1.4115.1.20.1.1.4.47.1.1.11",
    DstPrefixLen = "1.3.6.1.4.1.4115.1.20.1.1.4.47.1.1.12",
    SrcPortStart = "1.3.6.1.4.1.4115.1.20.1.1.4.47.1.1.13",
    SrcPortEnd = "1.3.6.1.4.1.4115.1.20.1.1.4.47.1.1.14",
    DstPortStart = "1.3.6.1.4.1.4115.1.20.1.1.4.47.1.1.15",
    DstPortEnd = "1.3.6.1.4.1.4115.1.20.1.1.4.47.1.1.16",
    Action = "1.3.6.1.4.1.4115.1.20.1.1.4.47.1.1.17",
    RowStatus = "1.3.6.1.4.1.4115.1.20.1.1.4.47.1.1.18",
    WalkPortFiltering = "1.3.6.1.4.1.4115.1.20.1.1.4.47.1",
}

export enum OidDataType { string = 66, byte = 2, address = 4, Walk }
export enum OidFilterType { UDP = "0", TCP = "1", UDP_TCP = "2", All = "3" }
export enum OidRangeType { Range = "0", All = "1", Single = "2" }
export enum OidEnabledType { Enabled = "1", Disabled = "2", ToDelete = "6" }

export class VirginOidBase {
    key: string;
    type: OidDataType;

    static create(type: OidType, index: string = "") {
        switch (type) {
            case OidType.DHCPIsEnabled:
            case OidType.ProtoType:
            case OidType.SrcRange:
            case OidType.DstRange:
            case OidType.RowStatus:
            case OidType.IpVer:
            case OidType.Direction:
            case OidType.Action:
                return new VirginByteOid(index ? type + "." + index : type);
            case OidType.SrcStartAddr:
            case OidType.SrcEndAddr:
            case OidType.DstStartAddr:
            case OidType.DstEndAddr:
                return new VirginAddressOid(index ? type + "." + index : type);
            case OidType.SrcPortStart:
            case OidType.SrcPortEnd:
            case OidType.DstPortStart:
            case OidType.DstPortEnd:
            case OidType.SrcPrefixLen:
            case OidType.DstPrefixLen:
                return new VirginStringOid(index ? type + "." + index : type);
            case OidType.WalkPortFiltering:
                return new VirginWalkOid(type);
            default:
                throw ("OidType not found");
        }
    }

    constructor(key: string, type: OidDataType) {
        this.key = key;
        this.type = type;
    }

    getQuery(): string {
        return `${this.key};`;
    }

    setQuery(value: string): string {
        return `${this.key}=${value};${this.type};`
    }

    convertResponseObjectToValue(obj: any): any {
        throw ("not implemented");
    }
}

export class VirginByteOid extends VirginOidBase {
    constructor(key: string) {
        super(key, OidDataType.byte);
    }

    convertResponseObjectToValue(obj: any): boolean {
        return obj[this.key];
    }
}

export class VirginAddressOid extends VirginOidBase {
    constructor(key: string) {
        super(key, OidDataType.address);
    }

    convertResponseObjectToValue(obj: any): string {
        return obj[this.key];
    }
}

export class VirginStringOid extends VirginOidBase {
    constructor(key: string) {
        super(key, OidDataType.string);
    }

    convertResponseObjectToValue(obj: any): string {
        return obj[this.key];
    }
}

export class VirginWalkOid extends VirginOidBase {
    constructor(key: string) {
        super(key, OidDataType.Walk);
    }

    convertResponseObjectToValue(obj: any): any {
        return RouterFilter.fromOidWalkResult(obj);
    }

    setQuery(value: string): string {
        throw ("set not implemented for walk oid");
    }
}