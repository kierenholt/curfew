import { RunResult } from "sqlite3";
import { Db } from "./db";
import { Helpers } from "../helpers";

export class Domain {
    id: number;
    component: string;
    listId: number;

    constructor(id: number, component: string, listId: number) {
        this.id = id;
        this.component = component;
        this.listId = listId;
    }

    static seed() {
        this.create("google",1);
    }

    static createTable(): Promise<RunResult> {
        return Db.run(`
            create table domain (
                id integer primary key not null,
                component text not null,
                listId integer not null
            );
        `)
    }

    static create(component: string, listId: number): Promise<number> {
        return Db.run(`
            insert into domain (component, listId)
            values ('${component}', ${listId})
        `)
        .then(result => result.lastID);
    }

    static getById(id: number): Promise<Domain | null> {
        return Db.get(`
            select * from domain
            where id = ${id}
        `)
        .then((result:any) => result ? new Domain(result.id, result.component, result.listId) : null);
    }

    static getListIdFromDomain(domain: string): Promise<number | null> {
        let spl = Helpers.replaceAll(domain,".", "','");
        return Db.get(`
            select listId from domain
            where component in ('${spl}')
        `)
        .then(result => result?.listId);
    }

    static delete(id: number): Promise<RunResult> {
        return Db.run(`
            delete from domain
            where id = ${id}
        `)
    }


}