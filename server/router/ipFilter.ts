import { IPAddress } from "./IPAddress";

export class IPFilter {
    dest: IPAddress;
    index: string;

    constructor(index: string, dest: IPAddress) {
        this.dest = dest;
        this.index = index;
    }
}
