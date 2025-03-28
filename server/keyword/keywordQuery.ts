import { RunResult } from "sqlite3";
import { AsyncDatabase } from "promised-sqlite3";
import { Keyword } from "./keyword";

export class KeywordQuery {
    connection: AsyncDatabase;

    constructor(connection: AsyncDatabase) {
        this.connection = connection;
    }
    
    createTable(): Promise<RunResult> {
        return this.connection.run(`
            create table searchTerm (
                id integer primary key not null,
                name text not null,
                expression text not null,
                ports text null,
                isActive integer not null
            );
        `)
    }

    async seed() {
        await this.create("youtube", "youtube,googlevideo", "", 1);
        await this.create("brawlstars", "brawlstars,supercell", "9339", 0);
        await this.create("tiktok", "tiktok", "", 1);
    }

    async create(name: string, expression: string, ports: string, isActive: number): Promise<number> {
        return this.connection.run(`
            insert into searchTerm (name, expression, ports, isActive)
            values (?, ?, ?, ?)
        `, [name, expression, ports, isActive])
        .then(result => result.changes);
    }

    async update(id: number, name: string, expression: string, ports: string, isActive: number): Promise<number> {
        return this.connection.run(`
            update searchTerm 
            set name = ?,
                expression = ?,
                ports = ?,
                isActive = ?
            where id=${id}
        `, [name, expression, ports, isActive])
        .then(result => result.changes);
    }

    async setIsActive(id: number, value: number): Promise<number> {
        return this.connection.run(`
            update searchTerm 
                set isActive = ?
            where id=?
        `, [value, id])
        .then(result => result.changes);
    }

    async setAllActive(): Promise<number> {
        return this.connection.run(`
            update searchTerm 
            set isActive = 1
        `)
        .then(result => result.changes);
    }

    async setAllInactive(): Promise<number> {
        return this.connection.run(`
            update searchTerm 
            set isActive = 0
        `)
        .then(result => result.changes);
    }

    getById(id: number): Promise<Keyword | null> {
        return this.connection.get(`
            select * from searchTerm
            where id=${id}
        `)
        .then((result: any) => result ? new Keyword(
            result.id,
            result.name, 
            result.expression,
            result.ports,
            result.isActive) : null);
    }

    getAllActive(): Promise<Keyword[]> {
        return this.connection.all(`
            select * from searchTerm
            where isActive=1
            order by id asc
        `)
        .then((result: any) => result.map((r:any) => new Keyword(
            r.id,
            r.name,
            r.expression,
            r.ports,
            r.isActive)))
    }

    getAll(): Promise<Keyword[]> {
        return this.connection.all(`
            select * from searchTerm
            order by id asc
        `)
        .then((result: any) => result.map((r:any) => new Keyword(
            r.id,
            r.name,
            r.expression,
            r.ports,
            r.isActive)))
    }
    
    delete(id: number): Promise<number> {
        return this.connection.run(`
            delete from searchTerm
            where id = ?
        `, [id])
        .then((result: RunResult) => result.changes);
    }

    async isDomainBlocked(domain: string) {
        let terms = await this.getAllActive();
        return terms.some(t => t.blocksDomain(domain))
    }
}