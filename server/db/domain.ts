import { RunResult } from "sqlite3";
import { Db } from "./db";
import { Helpers } from "../helpers";
import { List } from "./list";

export class Domain {
    id: number;
    component: string;
    listId: number;
    private _list: Promise<List | null> | undefined;

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
                listId integer not null,
                FOREIGN KEY(listId) REFERENCES list(id)
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

    static update(id: number, component: string, listId: number): Promise<number> {
        return Db.run(`
            update domain 
            set component='${component}', 
            listId=${listId}
            where id=${id}
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

    static getFromDomainName(domainName: string): Promise<Domain | null> {
        let spl = Helpers.replaceAll(domainName,".", "','");
        return Db.get(`
            select * from domain
            where component in ('${spl}')
        `)
        .then((result: any) => result ? new Domain(result.id, result.component, result.listId) : null);
    }

    static delete(id: number): Promise<number> {
        return Db.run(`
            delete from domain
            where id = ${id}
        `)
        .then((result: RunResult) => result.changes);
    }

    get list(): Promise<List | null> {
        if (this._list == undefined) {
            this._list = List.getById(this.listId);
        }
        return this._list;
    }

    static getAll(): Promise<Domain[]> {
        return Db.all(`
            select * from domain
        `)
        .then((result: any) => result.map((r:any) => new Domain(r.id, r.component, r.listId)))
    }

}