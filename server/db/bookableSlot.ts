import { Db } from "./db";
import { RunResult } from "sqlite3";

export class BookableSlot {
    id: number;
    refillsOn: Date;
    numSlots: number;
    duration: number;

    constructor(id: number, refillsOn: number, numSlots: number, duration: number) {
        this.id = id;
        this.refillsOn = new Date(refillsOn);
        this.numSlots = numSlots;
        this.duration = duration;
    }

    static createTable(): Promise<RunResult> {
        return Db.run(`
            create table bookableSlot (
                id integer primary key not null,
                refillsOn integer not null,
                numSlots integer not null,
                duration integer not null
                );
        `)
    }

    static create(refillsOn: Date, numSlots: number, duration: number): Promise<number> {
        return Db.run(`
            insert into bookableSlot (refillsOn, numSlots, duration)
            values (${refillsOn.valueOf()}, ${numSlots}, ${duration})
        `)
        .then(result => result.lastID);
    }
    
    static update(id: number, refillsOn: Date, numSlots: number, duration: number): Promise<number> {
        return Db.run(`
            update bookableSlot 
            set refillsOn=${refillsOn.valueOf()}, 
            numSlots=${numSlots}, 
            duration=${duration}
            where id=${id}
        `)
        .then(result => result.changes);
    }

    static getById(id: number): Promise<BookableSlot | null> {
        return Db.get(`
            select * from bookableSlot
            where id = ${id}
        `)
        .then((result:any) => result ? new BookableSlot(result.id, result.refillsOn, result.number, result.duration) : null);
    }

    static delete(id: number): Promise<number> {
        return Db.run(`
            delete from bookableSlot
            where id = ${id}
        `)
        .then((result: RunResult) => result.changes);
    }

    static getAll(): Promise<BookableSlot[]> {
        return Db.all(`
            select * from bookableSlot
        `)
        .then((result: any) => result.map((r:any) => new BookableSlot(r.id, r.refillsOn, r.numSlots, r.duration)))
    }
}