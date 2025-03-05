export class PortFilter {
    port: number;
    index: string;
    
    constructor(index: string, port: number) {
        this.index = index;
        this.port = port;
    }
}