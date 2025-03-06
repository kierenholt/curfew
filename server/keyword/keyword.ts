export class Keyword {

    id: number;
    name: string;
    expression: string;
    ports: string;
    isActive: number;
    
    constructor(id: number, name: string, expression: string, ports: string, isActive: number) {
        this.id = id;
        this.name = name;
        this.expression = expression;
        this.ports = ports;
        this.isActive = isActive;
    }
        
    get needles(): string[] {
        if (this.expression.length == 0) {
            return [];
        }
        return this.expression.split(",");
    }

    get portsArray(): number[] {
        if (this.ports) return this.ports.split(",").map(p => Number(p));
        return [];
    }
    
    blocksDomain(domain: string) {
        return this.needles.some(s => domain.indexOf(s) != -1);
    }
}