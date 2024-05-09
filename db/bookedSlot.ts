import { Db } from "./db";
import { RunResult } from "sqlite3";

export class BookedSlot {
    id: number;
    startsOn: Date;
    endsOn: Date;
    userId: number;
    
    constructor(id: number, startsOn: number, endsOn: number, userId: number) {
        this.id = id;
        this.startsOn = new Date(startsOn);
        this.endsOn = new Date(endsOn);
        this.userId = userId;
    }

    static async seed() {
        let now = new Date();
        let tomorrow = new Date(new Date().valueOf() + 86400 * 1000);
        await this.create(now, tomorrow, 2);
    }

    static createTable(): Promise<RunResult> {
        return Db.run(`
            create table bookedSlot (
                id integer primary key not null,
                startsOn integer not null,
                endsOn integer not null,
                userId integer not null
                );
        `)
    }

    static create(startOn: Date, endsOn: Date, userId: number): Promise<number> {
        return Db.run(`
            insert into bookedSlot (startsOn, endsOn, userId)
            values (${startOn.valueOf()}, ${endsOn.valueOf()}, ${userId})
        `)
        .then(result => result.lastID);
    }

    static getById(id: number): Promise<BookedSlot | null> {
        return Db.get(`
            select * from bookedSlot
            where id = ${id}
        `)
        .then((result:any) => result ? new BookedSlot(result.id, result.startsOn, result.endsOn, result.userId) : null);
    }

    static delete(id: number): Promise<RunResult> {
        return Db.run(`
            delete from bookedSlot
            where id = ${id}
        `)
    }

    static bookedSlotExistsNow(userId: number): Promise<boolean> {
        let now = new Date().valueOf();
        return Db.get(`
            select * from bookedSlot
            where startsOn < ${now} and endsOn > ${now} and userId = ${userId}
        `)
        .then(result => result != null);
    }
}