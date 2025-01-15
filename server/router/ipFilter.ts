import { IPAddress } from "../IPAddress";
import { NetworkSetting } from "../settings/networkSetting";
import { IFilter } from "./iFilter";
import { OidEnabledType, OidType } from "./virginOids";

export class IPFilter implements IFilter {
    dest: IPAddress;
    index: string;

    constructor(index: string, dest: IPAddress) {
        this.dest = dest;
        this.index = index;
    }

    oidsAndValues(): [OidType[], string[], string] {
        let types = [OidType.IpVer, OidType.Direction, OidType.ProtoType,
        OidType.SrcRange, OidType.SrcStartAddr, OidType.SrcEndAddr, OidType.SrcPrefixLen,
        OidType.DstRange, OidType.DstStartAddr, OidType.DstEndAddr, OidType.DstPrefixLen,
        OidType.SrcPortStart, OidType.SrcPortEnd, OidType.DstPortStart, OidType.DstPortEnd,
        OidType.Action, OidType.RowStatus
        ];
        let values: string[] = ["1", "1", "3",
            "1", 
            "%24" + NetworkSetting.getFullNetworkAsHex(),
            "%24" + NetworkSetting.getFullNetworkAsHex(),
            "0",
            "2", 
            "%24" + this.dest.toHex(), 
            "%2400000000", 
            "0",
            "", "", 
            "", "",
            "1", OidEnabledType.Enabled
        ];
        return [types, values, this.index];
    }
}
