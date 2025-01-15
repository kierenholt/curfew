import { Db } from "../db";
import { RunResult } from "sqlite3";

//when activated:
//selects matching domains from the dns response table, activates those ip filters on the router
//also checks all dns queries

export class KeywordDb {

    blocksDomain(domain: string) {
        return this.needles.some(s => domain.indexOf(s) != -1);
    }
    
    get needles(): string[] {
        return this.expression.split(",");
    }

    get portsArray(): number[] {
        if (this.ports) return this.ports.split(",").map(p => Number(p));
        return [];
    }
    
    static createTable(): Promise<RunResult> {
        return Db.run(`
            create table searchTerm (
                id integer primary key not null,
                name text not null,
                expression text not null,
                ports text null,
                isActive integer not null
            );
        `)
    }

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

    static async seed() {
        await this.create("youtube", "youtube,googlevideo", "", 1);
        await this.create("brawlstars", "brawlstars,supercell", "9339", 0);
        await this.create("tiktok", "tiktok", "", 1);
    }

    static async create(name: string, expression: string, ports: string, isActive: number): Promise<number> {
        return Db.run(`
            insert into searchTerm (name, expression, ports, isActive)
            values (?, ?, ?, ?)
        `, [name, expression, ports, isActive])
        .then(result => result.changes);
    }

    static async update(id: number, name: string, expression: string, ports: string, isActive: number): Promise<number> {
        return Db.run(`
            update searchTerm 
            set name = ?,
                expression = ?,
                ports = ?,
                isActive = ?
            where id=${id}
        `, [name, expression, ports, isActive])
        .then(result => result.changes);
    }

    static getById(id: number): Promise<KeywordDb | null> {
        return Db.get(`
            select * from searchTerm
            where id=${id}
        `)
        .then(result => result ? new KeywordDb(
            result.id,
            result.name, 
            result.expression,
            result.ports,
            result.isActive) : null);
    }

    static getAllActive(): Promise<KeywordDb[]> {
        return Db.all(`
            select * from searchTerm
            where isActive=1
            order by id asc
        `)
        .then((result: any) => result.map((r:any) => new KeywordDb(
            r.id,
            r.name,
            r.expression,
            r.ports,
            r.isActive)))
    }

    static getAll(): Promise<KeywordDb[]> {
        return Db.all(`
            select * from searchTerm
            order by id asc
        `)
        .then((result: any) => result.map((r:any) => new KeywordDb(
            r.id,
            r.name,
            r.expression,
            r.ports,
            r.isActive)))
    }
    
    static delete(id: number): Promise<number> {
        return Db.run(`
            delete from searchTerm
            where id = ?
        `, [id])
        .then((result: RunResult) => result.changes);
    }
}