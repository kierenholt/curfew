import { RunResult } from "sqlite3";
import { Db } from "./db";

export enum FilterAction {
    alwaysBlock = 0, alwaysAllow = 1, needsSlot = 2 
}

export class List {
    id: number;
    name: string;
    filterAction: FilterAction;

    constructor(id: number, name: string, filterAction: FilterAction) {
        this.id = id;
        this.name = name;
        this.filterAction = filterAction;
    }

    static createTable(): Promise<RunResult> {
        return Db.run(`
            create table list (
                id integer primary key not null,
                name text not null,
                filterAction integer not null
            );
        `)
    }

    static seed() {
        this.create("games", FilterAction.needsSlot);
    }

    static create(name: string, filterAction: FilterAction): Promise<number> {
        return Db.run(`
            insert into list (name, filterAction)
            values ('${name}', ${filterAction})
        `)
        .then(result => result.lastID);
    }

    static getById(id: number): Promise<List | null> {
        return Db.get(`
            select * from list
            where id = ${id}
        `)
        .then((result:any) => result ? new List(result.id, result.name, result.filterAction) : null);
    }

    static delete(id: number): Promise<RunResult> {
        return Db.run(`
            delete from list
            where id = ${id}
        `)
    }

    static getAll(): Promise<List[]> {
        return Db.all(`
            select * from list
        `)
        .then((result: any) => result.map((r:any) => new List(r.id, r.name, r.filterAction)))
    }


}