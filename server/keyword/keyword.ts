export class Keyword {

    id: number;
    name: string;
    expression: string;
    allPortRanges: string;
    isActive: number;
    
    constructor(id: number, name: string, expression: string, ports: string, isActive: number) {
        this.id = id;
        this.name = name;
        this.expression = expression;
        this.allPortRanges = ports;
        this.isActive = isActive;
    }
        
    get needles(): string[] {
        if (this.expression.length == 0) {
            return [];
        }
        return this.expression.split(",");
    }

    get portsArray(): [number, number][] {
        let ret: [number, number][] = [];
        if (this.allPortRanges) {
            let rangeStrings = this.allPortRanges.split(",");
            for (let rangeString of rangeStrings) {
                if (rangeString.indexOf("-") == -1) { //no dash -  single port
                   ret.push([Number(rangeString), Number(rangeString)]);
                }
                else { //port range
                    let splByDash = rangeString.split("-");
                    ret.push([Number(splByDash[0]), Number(splByDash[1])]);
                }
            }
        }
        return ret;
    }
    
    blocksDomain(domain: string) {
        return this.needles.some(s => domain.indexOf(s) != -1);
    }
}