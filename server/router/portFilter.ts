import { NetworkSetting } from "../settings/networkSetting";
import { IFilter } from "./iFilter";
import { OidEnabledType, OidType } from "./virginOids";


export class PortFilter implements IFilter {
    port: number;
    index: string;
    
    constructor(index: string, port: number) {
        this.index = index;
        this.port = port;
    }

    oidsAndValues(): [OidType[], string[], string] {
        let types = [OidType.IpVer, OidType.Direction, OidType.ProtoType,
        OidType.SrcRange, OidType.SrcStartAddr, OidType.SrcEndAddr, OidType.SrcPrefixLen,
        OidType.DstRange, OidType.DstStartAddr, OidType.DstEndAddr, OidType.DstPrefixLen,
        OidType.SrcPortStart, OidType.SrcPortEnd, OidType.DstPortStart, OidType.DstPortEnd,
        OidType.Action, OidType.RowStatus
        ];
        let values: string[] = ["1", "1", "2",
            "1",
            "%24" + NetworkSetting.getFullNetworkAsHex(),
            "%24" + NetworkSetting.getFullNetworkAsHex(),
            "0",
            "1",
            "undefined",
            "undefined",
            "0",
            "1", "65535", 
            this.port.toString(), this.port.toString(),
            "1", OidEnabledType.Enabled
        ];
        return [types, values, this.index];
    }
}