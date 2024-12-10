import { SearchTermDb } from "./searchTermDb";

export function blocksDomain(this: SearchTermDb, domain: string) {
    return this.getNeedles().some(s => domain.indexOf(s) != -1);
}

export function getNeedles(this: SearchTermDb) {
    return this.expression.split(",");
}

