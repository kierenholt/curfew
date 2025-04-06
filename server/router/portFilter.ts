import { IEquals } from "../utility/helpers";

export class PortFilter implements IEquals<PortFilter> {
    ports: [number, number];
    index: string;
    
    constructor(index: string, ports: [number, number]) {
        this.index = index;
        this.ports = ports;
    }

    equals(other: PortFilter): boolean {
        return other instanceof PortFilter && this.ports[0] == other.ports[0] && this.ports[1] == other.ports[1];
    }
}