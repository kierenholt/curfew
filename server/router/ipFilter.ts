import { IEquals } from "../utility/helpers";
import { IPAddress } from "./IPAddress";

export class IPFilter implements IEquals<IPFilter> {
    dest: IPAddress;
    index: string;

    constructor(index: string, dest: IPAddress) {
        this.dest = dest;
        this.index = index;
    }

    equals(other: IPFilter): boolean {
        return other instanceof IPFilter && this.dest.equals(other.dest);
    }
}
