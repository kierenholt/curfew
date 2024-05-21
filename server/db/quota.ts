import { Db } from "./db";
import { RunResult } from "sqlite3";


export class Quota {
    groupId: number;
    day: number;

    refreshAmount: number;
    rollsOver: boolean;
    maxDuration: number;
    cooldown: number;

    constructor(groupIdDay: string, 
        refreshAmount: number, rollsOver: boolean, 
        maxDuration: number, cooldown: number) {
        let spl = groupIdDay.split("-");
        this.groupId = Number(spl[0]);
        this.day = Number(spl[1]);
        this.refreshAmount = refreshAmount;
        this.rollsOver = rollsOver;
        this.maxDuration = maxDuration;
        this.cooldown = cooldown;
    }

    static async createDefault(groupId: number): Promise<void> {
        for (let day = 0; day < 7; day++) {
            await Db.run(`
                insert into quota (groupIdDay, refreshAmount, rollsOver, maxDuration, cooldown)
                values ('${groupId}-${day}', 60, 0, 30, 30)
            `);
        }
        return Promise.resolve();
    }

    static createTable(): Promise<RunResult> {
        return Db.run(`
            create table quota (
                groupIdDay string primary key not null,
                refreshAmount integer not null,
                maxDuration integer not null,
                rollsOver integer not null,
                cooldown integer not null
                );
        `)
    }

    static async update(groupId: number, day: number, refreshAmount: number, 
        rollsOver: boolean, maxDuration: number, 
        cooldown: number): Promise<number> {
            return await Db.run(`
                update quota
                set refreshAmount=${refreshAmount}, 
                rollsOver=${rollsOver ? 1 : 0},
                maxDuration=${maxDuration},
                cooldown=${cooldown}
                where groupIdDay='${groupId}-${day}'
            `)
            .then((result: RunResult) => result.changes);
        }
    
    static getByGroupId(groupId: number): Promise<Quota[]> {
        return Db.all(`
            select * from quota
            where groupIdDay like '${groupId}-%'
        `)
        .then((result: any) => {
            return result.map((r:any) => new Quota(
                r.groupIdDay, r.refreshAmount, 
                r.rollsOver, r.maxDuration, r.cooldown));
            });
    }

    static getByGroupIdDay(groupId: number, day: number): Promise<Quota | null> {
        return Db.get(`
            select * from quota
            where groupIdDay = '${groupId}-${day}'
        `)
        .then((result: any) => new Quota(
            result.groupIdDay, result.refreshAmount, 
            result.rollsOver, result.maxDuration, result.cooldown
            ))
    }

    static deleteAllDays(groupId: number): Promise<number> {
        return Db.run(`
            delete from device
            where groupIdDay like '${groupId}-%'
        `)
        .then((result: RunResult) => result.changes);
    }

    static getAll(): Promise<Quota[]> {
        return Db.all(`
            select * from quota
        `)
        .then((result: any) => result.map((r:any) => new Quota(
            r.groupIdDay, r.refreshAmount, 
            r.rollsOver, r.maxDuration, r.cooldown
            )))
    }
}