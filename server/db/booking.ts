import { Db } from "./db";
import { RunResult } from "sqlite3";
import { User } from "./user";
import { Quota } from "./quota";

export class Booking {
    id: number;
    startsOn: Date;
    userId: number;
    private _user: Promise<User | null> | undefined = undefined;
    groupId: number;
    day: number;
    endsOn: Date;
    cooldown: number;
    
    constructor(id: number, startsOn: number, userId: number, groupId: number, day: number, endsOn: number, cooldown: number) {
        this.id = id;
        this.startsOn = new Date(startsOn);
        this.userId = userId;
        this.groupId = groupId;
        this.day = day;
        this.endsOn = new Date(endsOn);
        this.cooldown = cooldown;
    }

    static async seed() {
        //let now = new Date();
        //await this.create(now, 2);
    }

    static createTable(): Promise<RunResult> {
        return Db.run(`
            create table bookedSlot (
                id integer primary key not null,
                startsOn integer not null,
                userId integer not null,
                groupId integer not null,
                day integer not null,
                endsOn integer not null,
                cooldown integer not null,
                FOREIGN KEY(userId) REFERENCES user(id)
                );
        `)
    }

    static async create(startsOn: Date, userId: number, duration: number): Promise<number> {
        
        let user = await User.getById(userId);
        if (user == null) {
            return 0;
        }
        let quota = await Quota.getByGroupIdDay(user.groupId, startsOn.getDay());
        if (quota == null) {
            return 0;
        }
        
        let endsOn = startsOn.valueOf() + duration*60000;
        return Db.run(`
            insert into bookedSlot (startsOn, userId, groupId, day, endsOn, cooldown)
            values (${startsOn.valueOf()}, ${user.id}, ${user.groupId}, ${quota.day}, ${endsOn}, ${quota.cooldown})
        `)
        .then(result => result.lastID);
    }

    static update(id: number, startsOn: Date, userId: number, groupId: number, day: number, duration: number, cooldown: number): Promise<number> {
        let endsOn = startsOn.valueOf() + duration* 60000;
        return Db.run(`
            update bookedSlot
            set startsOn=${startsOn.valueOf()},
            userId=${userId}
            groupId=${groupId}
            day=${day}
            endsOn=${endsOn}
            cooldown=${cooldown}
            where id=${id}
        `)
        .then(result => result.lastID);
    }


    static getById(id: number): Promise<Booking | null> {
        return Db.get(`
            select * from bookedSlot
            where id = ${id}
        `)
        .then((result:any) => result ? new Booking(
            result.id, 
            result.startsOn, 
            result.userId,
            result.groupId,
            result.day,
            result.endsOn,
            result.cooldown) : null);
    }

    static getByUserId(userId: number): Promise<Booking[]> {
        return Db.all(`
            select * from bookedSlot
            where userId = ${userId}
        `)
        .then((result: any) => result.map((r:any) => 
            new Booking(r.id, r.startsOn, r.userId, r.groupId, r.day, r.endsOn, r.cooldown)
        ))
    }

    //use for checking bookings against quotas, when user makes a booking
    static getByUserIdAfter(userId: number, after: Date): Promise<Booking[]> {
        return Db.all(`
            select * from bookedSlot
            where userId = ${userId}
            and startsOn > ${after.valueOf()}
        `)
        .then((result: any) => result.map((r:any) => 
            new Booking(r.id, r.startsOn, r.userId, r.groupId, r.day, r.endsOn, r.cooldown)
        ))
    }

    //use for checking if booking exists now
    static existsNowForUser(userId: number): Promise<boolean> {
        let now = new Date().valueOf();
        return Db.all(`
            select * from bookedSlot
            where userId = ${userId}
            and startsOn < ${now} and endsOn > ${now}
        `)
        .then((result: any) => result.map((r:any) => 
            r.length > 0
        ))
    }

    static delete(id: number): Promise<number> {
        return Db.run(`
            delete from bookedSlot
            where id = ${id}
        `)
        .then((result: RunResult) => result.changes);
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

    static getAll(): Promise<Booking[]> {
        return Db.all(`
            select * from bookedSlot
        `)
        .then((result: any) => result.map((r:any) => 
            new Booking(r.id, r.startsOn, r.userId, r.groupId, r.day, r.endsOn, r.cooldown)
        ))
    }
}