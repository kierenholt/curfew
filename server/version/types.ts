import { CurfewDb } from "../db";

export interface Migration {
    from: string,
    to: string, 
    func: (db: CurfewDb) => void;
}