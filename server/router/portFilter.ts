import { IEquals } from "../utility/helpers";

export class PortFilter implements IEquals<PortFilter> {
    port: number;
    index: string;
    
    constructor(index: string, port: number) {
        this.index = index;
        this.port = port;
    }

    equals(other: PortFilter): boolean {
        return this.port == other.port;
    }
}