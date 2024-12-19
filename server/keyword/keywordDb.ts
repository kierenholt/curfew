import { Db } from "../db";
import { Helpers } from "../helpers";
import { RunResult } from "sqlite3";

//when activated:
//selects matching domains from the dns response table, activates those ip filters on the router
//also checks all dns queries

export class KeywordDb {

    blocksDomain(domain: string) {
        return this.needles.some(s => domain.indexOf(s) != -1);
    }
    
    get needles() {
        return this.expression.split(",");
    }

    
    static createTable(): Promise<RunResult> {
        return Db.run(`
            create table searchTerm (
                id integer primary key not null,
                name text not null,
                expression text not null,
                isActive integer not null
            );
        `)
    }

    id: number;
    name: string;
    expression: string;
    isActive: number;

    constructor(id: number, name: string, expression: string, isActive: number) {
        this.id = id;
        this.name = name;
        this.expression = expression;
        this.isActive = isActive;
    }

    static async seed() {
        await this.create("youtube", "youtube,googlevideo", 1);
        await this.create("brawlstars", "brawlstars,supercell", 0);
        await this.create("tiktok", "tiktok", 0);
    }

    static async create(name: string, expression: string, isActive: number): Promise<number> {
        return Db.run(`
            insert into searchTerm (name, expression, isActive)
            values (?, ?, ?)
        `, [name, expression, isActive])
        .then(result => result.changes);
    }

    static async update(id: number, name: string, expression: string, isActive: number): Promise<number> {
        return Db.run(`
            update searchTerm 
            set name = ?,
                expression = ?,
                isActive = ?
            where id=${id}
        `, [name, expression, isActive])
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