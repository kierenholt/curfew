import { Db } from "../db";
import { Helpers } from "../helpers";
import { RunResult } from "sqlite3";
import { blocksDomain, getNeedles } from "./searchTerm";

//when activated:
//selects matching domains from the dns response table, activates those ip filters on the router
//also checks all dns queries

export class SearchTermDb {

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
    blocksDomain = blocksDomain;
    getNeedles = getNeedles;

    constructor(id: number, name: string, expression: string, isActive: number) {
        this.id = id;
        this.name = name;
        this.expression = expression;
        this.isActive = isActive;
    }

    static async seed() {
        await this.create("youtube", "youtube,googlevideo", 0);
        await this.create("brawlstars", "brawlstars,supercell", 0);
        await this.create("tiktok", "tiktok", 0);
    }

    static async create(name: string, expression: string, isActive: number): Promise<number> {
        return Db.run(`
            insert into searchTerm (name, expression, isActive)
            values ('${Helpers.Sanitise(name)}', '${Helpers.Sanitise(expression)}', ${isActive})
        `)
        .then(result => result.changes);
    }

    static async update(id: number, name: string, expression: string, isActive: number): Promise<number> {
        return Db.run(`
            update searchTerm 
            set name = '${Helpers.Sanitise(name)}',
                expression = '${Helpers.Sanitise(expression)}',
                isActive = ${isActive}
            where id=${id}
        `)
        .then(result => result.changes);
    }

    static getById(id: number): Promise<SearchTermDb | null> {
        return Db.get(`
            select * from searchTerm
            where id=${id}
        `)
        .then(result => result ? new SearchTermDb(
            result.id,
            Helpers.Unsanitise(result.name), 
            Helpers.Unsanitise(result.expression),
            result.isActive) : null);
    }

    static getAllActive(): Promise<SearchTermDb[]> {
        return Db.all(`
            select * from searchTerm
            where isActive=1
            order by id asc
        `)
        .then((result: any) => result.map((r:any) => new SearchTermDb(
            r.id,
            Helpers.Unsanitise(r.name),
            Helpers.Unsanitise(r.expression),
            r.isActive)))
    }

    static getAll(): Promise<SearchTermDb[]> {
        return Db.all(`
            select * from searchTerm
            order by id asc
        `)
        .then((result: any) => result.map((r:any) => new SearchTermDb(
            r.id,
            Helpers.Unsanitise(r.name),
            Helpers.Unsanitise(r.expression),
            r.isActive)))
    }
}