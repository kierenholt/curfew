import { RunResult } from "sqlite3";
import { Db } from "./db";
import { Helpers } from "../helpers";
import { UserGroup } from "./userGroup";

export enum FilterAction {
    alwaysAllow = 1, needsBooking = 2, alwaysDeny = 3
}

export class Filter {
    id: number;
    groupId: number;
    component: string;
    action: FilterAction;
    static blackList: string[] = ["youtube","googlevideo","roblox","classroom6x","tiktok","unity","snapchat","goguardian","unity3d","tiktokcdn","facebook","brawlstars","tiktokcdn-eu","tiktokv","apple","aaplimg","brawlstargame","brawlstars","vungle","gameduo","liftoff","applovin","inner-activ","inmobicdn","inmobi","applvn","tiktokcdn-us","stats","ocsp","supercell","rbxcdn","crazygames","epicgames","epicgames","yohoho","poki","1001games","friv","numuki","coolmathgames","raft-wars","ytimg","fbcdn","brawlstars","snapchat"];

    constructor(id: number, component: string, groupId: number, action: number) {
        this.id = id;
        this.component = component;
        this.groupId = groupId;
        this.action = action as FilterAction;
    }

    static seed() {
        for (let word of Filter.blackList) {
            Filter.create(
                word, 
                UserGroup.FIRST_GROUP_ID, 
                FilterAction.needsBooking
            );
        }
    }

    static createTable(): Promise<RunResult> {
        return Db.run(`
            create table filter (
                id integer primary key not null,
                component text not null,
                groupId integer not null,
                action integer not null,
                FOREIGN KEY(groupId) REFERENCES userGroup(id)
            );
        `)
    }

    static create(component: string, groupId: number, action: FilterAction): Promise<number> {
        return Db.run(`
            insert into filter (component, groupId, action)
            values ('${component}', ${groupId}, ${action.valueOf()})
        `)
        .then(result => result.lastID);
    }

    static update(id: number, component: string, groupId: number, action: FilterAction): Promise<number> {
        return Db.run(`
            update filter
            set component='${component}', 
            groupId=${groupId},
            action=${action.valueOf()}
            where id=${id}
        `)
        .then(result => result.changes);
    }

    static getById(id: number): Promise<Filter | null> {
        return Db.get(`
            select * from filter
            where id = ${id}
        `)
        .then((result:any) => result ? new Filter(
            result.id, 
            result.component, 
            result.groupId,
            result.action) : null);
    }

    static getByGroupId(groupId: number): Promise<Filter[]> {
        return Db.all(`
            select * from filter
            where groupId = ${groupId}
            order by component asc
        `)
        .then((result: any) => result.map((r:any) => new Filter(
            r.id, 
            r.component, 
            r.groupId,
            r.action)))
    }

    static getFromComponentAndGroup(component: string, groupId: number): Promise<Filter | null> {
        return Db.get(`
            select * from filter
            where groupId = ${groupId} and component = '${component}' 
        `)
        .then((result: any) => result ? new Filter(
            result.id, 
            result.component, 
            result.groupId,
            result.action) : null);
    }

    static getFromDomainNameAndGroup(domainName: string, groupId: number): Promise<Filter | null> {
        let spl = Helpers.replaceAll(domainName,".", "','");
        return Db.get(`
            select * from filter
            where groupId = ${groupId} and component in ('${spl}') 
        `)
        .then((result: any) => result ? new Filter(
            result.id, 
            result.component, 
            result.groupId,
            result.action) : null);
    }

    static delete(id: number): Promise<number> {
        return Db.run(`
            delete from filter
            where id = ${id}
        `)
        .then((result: RunResult) => result.changes);
    }

    static getAll(): Promise<Filter[]> {
        return Db.all(`
            select * from filter
        `)
        .then((result: any) => result.map((r:any) => new Filter(
            r.id, 
            r.component, 
            r.groupId,
            r.action)))
    }

}