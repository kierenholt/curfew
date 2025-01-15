import { Helpers } from "../helpers";
import { IPAddress } from "../IPAddress";
import { IPFilter } from "./ipFilter";
import { PortFilter } from "./portFilter";
import { OidType } from "./virginOids";


export class OidWalkGroup {
    obj: any;
    index: string;

    constructor(obj: any, key: string) {
        this.obj = obj;
        this.index = key;
    }

    toIpFilter(): IPFilter | null {
        let trimmedDest = Helpers.trim(this.obj[OidType.DstStartAddr],"$");
        if (IPAddress.isValid(trimmedDest)) {
            return new IPFilter(this.index, IPAddress.fromHex(trimmedDest));
        }
        return null;
    }

    toPortFilter(): PortFilter | null {
        let port = this.obj[OidType.DstPortStart];
        if (Number(port) > 0) {
            return new PortFilter(this.index, port);
        }
        return null;
    }

    get isValid() {
        return OidType.Direction in this.obj &&
            OidType.IpVer in this.obj &&
            OidType.Direction in this.obj &&
            OidType.ProtoType in this.obj &&
            OidType.SrcRange in this.obj &&
            OidType.SrcStartAddr in this.obj &&
            OidType.SrcEndAddr in this.obj &&
            OidType.SrcPrefixLen in this.obj &&
            OidType.DstRange in this.obj &&
            OidType.DstStartAddr in this.obj &&
            OidType.DstEndAddr in this.obj &&
            OidType.DstPrefixLen in this.obj &&
            OidType.SrcPortStart in this.obj &&
            OidType.SrcPortEnd in this.obj &&
            OidType.DstPortStart in this.obj &&
            OidType.DstPortEnd in this.obj &&
            OidType.Action in this.obj &&
            OidType.RowStatus in this.obj;
    }
}