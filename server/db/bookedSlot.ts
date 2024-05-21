import { Db } from "./db";
import { RunResult } from "sqlite3";
import { User } from "./user";
import { Quota } from "./quota";
import { Helpers } from "../helpers";

export class BookedSlot {
    id: number;
    startsOn: Date;
    endsOn: Date;
    userId: number;
    private _user: Promise<User | null> | undefined = undefined;
    
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
                userId integer not null,
                FOREIGN KEY(userId) REFERENCES user(id)
                );
        `)
    }

    static create(startsOn: Date, endsOn: Date, userId: number): Promise<number> {
        return Db.run(`
            insert into bookedSlot (startsOn, endsOn, userId)
            values (${startsOn.valueOf()}, ${endsOn.valueOf()}, ${userId})
        `)
        .then(result => result.lastID);
    }

    static update(id: number, startsOn: Date, endsOn: Date, userId: number): Promise<number> {
        return Db.run(`
            update bookedSlot
            set startsOn=${startsOn.valueOf()}, 
            endsOn=${endsOn.valueOf()}, 
            userId=${userId}
            where id=${id}
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

    static delete(id: number): Promise<number> {
        return Db.run(`
            delete from bookedSlot
            where id = ${id}
        `)
        .then((result: RunResult) => result.changes);
    }

    static bookedSlotInUse(userId: number): Promise<BookedSlot | null> {
        let now = new Date().valueOf();
        return Db.get(`
            select * from bookedSlot
            where startsOn < ${now} and endsOn > ${now} and userId = ${userId}
        `)
        .then((result: any) => result ? new BookedSlot(result.id, result.startOn, result.endsOn, result.userId) : null);
    }

    get user(): Promise<User | null> {
        if (this.user == null) { 
            this._user = Promise.resolve(null);
        }
        if (this._user == undefined) {
            this._user = User.getById(this.userId);
        }
        return this._user;
    }

    static getAll(): Promise<BookedSlot[]> {
        return Db.all(`
            select * from bookedSlot
        `)
        .then((result: any) => result.map((r:any) => new BookedSlot(r.id, r.startsOn, r.endsOn, r.userId)))
    }
}