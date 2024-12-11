import { Helpers } from "../helpers";
import { IPAddress } from "../IPAddress";
import { OidType } from "./virginOids";

export class RouterFilter {
    dest: IPAddress;
    index: string;

    static fromOidWalkResult(obj: any): RouterFilter[] {
        let sortedByIndex: any = {};
        for (let key in obj) {
            let [oid, index] = this.splitWalkResultKey(key);
            if (oid) {
                if (!(index in sortedByIndex)) {
                    sortedByIndex[index] = {};
                }
                sortedByIndex[index][oid] = obj[key];
            }
        }
        let ret = [];
        for (let key in sortedByIndex) {
            let group = sortedByIndex[key];
            if (this.isWalkResultGroupValid(group)) {
                let trimmed = Helpers.trim(group[OidType.DstStartAddr],"$");
                ret.push(new RouterFilter(key, IPAddress.fromHex(trimmed)));
            }
        }
        return ret;
    }

    static splitWalkResultKey(key: string) {
        let spl = key.split(".");
        let index = spl[spl.length - 1];
        let oid = spl.slice(0, -1).join(".");
        return [oid, index];
    }

    static isWalkResultGroupValid(group: any) {
        return OidType.Direction in group &&
            OidType.IpVer in group &&
            OidType.Direction in group &&
            OidType.ProtoType in group &&
            OidType.SrcRange in group &&
            OidType.SrcStartAddr in group &&
            OidType.SrcEndAddr in group &&
            OidType.SrcPrefixLen in group &&
            OidType.DstRange in group &&
            OidType.DstStartAddr in group &&
            OidType.DstEndAddr in group &&
            OidType.DstPrefixLen in group &&
            OidType.SrcPortStart in group &&
            OidType.SrcPortEnd in group &&
            OidType.DstPortStart in group &&
            OidType.DstPortEnd in group &&
            OidType.Action in group &&
            OidType.RowStatus in group;
    }

    constructor(index: string, dest: IPAddress) {
        this.dest = dest;
        this.index = index;
    }

    get oidsAndValuesForCreate(): [OidType[], string[], string] {
        let types = [OidType.IpVer, OidType.Direction, OidType.ProtoType,
        OidType.SrcRange, OidType.SrcStartAddr, OidType.SrcEndAddr, OidType.SrcPrefixLen,
        OidType.DstRange, OidType.DstStartAddr, OidType.DstEndAddr, OidType.DstPrefixLen,
        OidType.SrcPortStart, OidType.SrcPortEnd, OidType.DstPortStart, OidType.DstPortEnd,
        OidType.Action, OidType.RowStatus
        ];
        let values: string[] = ["1", "1", "3",
            "1", "$c0a80000", "$c0a80000", "0",
            "2", "%24" + this.dest.toHex(), "undefined", "0",
            "", "", "", "",
            "1", "2"
        ];
        return [types, values, this.index];
    }

    blocks(ip: IPAddress) {
        return this.dest.equals(ip);
    }
}