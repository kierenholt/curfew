import { RunResult } from "sqlite3";
import { Db } from "./db";
import { Helpers } from "../helpers";
import { UserGroup } from "./userGroup";

export enum FilterAction {
    alwaysAllow = 1, needsBooking = 2, alwaysDeny = 3
}

export class DomainFilter {
    id: number;
    component: string;
    groupId: number;
    filterAction: FilterAction;
    static blackList: string[] = ["youtube","googlevideo","roblox","classroom6x","tiktok","unity","snapchat","goguardian","-tiktok","unity3d","classroom6x","goguardian","classroom6x","tiktokcdn","facebook","brawlstars","tiktokcdn-eu","tiktokv","apple","aaplimg","brawlstargame","brawlstarsgame","brawlstars","vungle","gameduo","liftoff","applovin","inner-activ","inmobicdn","inmobi","applvn","tiktokcdn-us","stats","ocsp","supercell","rbxcdn","crazygames","epicgames","epicgames","yohoho","poki","1001games","friv","numuki","coolmathgames","raft-wars","ytimg","fbcdn","brawlstars","snapchat"];

    constructor(id: number, component: string, groupId: number, filterAction: number) {
        this.id = id;
        this.component = component;
        this.groupId = groupId;
        this.filterAction = filterAction as FilterAction;
    }

    static seed() {
        for (let word of DomainFilter.blackList) {
            DomainFilter.create(word, UserGroup.FIRST_GROUP_ID, FilterAction.needsBooking);
        }
    }

    static createTable(): Promise<RunResult> {
        return Db.run(`
            create table domain (
                id integer primary key not null,
                component text not null,
                groupId integer not null,
                filterAction integer not null,
                FOREIGN KEY(groupId) REFERENCES userGroup(id)
            );
        `)
    }

    static create(component: string, groupId: number, filterAction: FilterAction): Promise<number> {
        return Db.run(`
            insert into domain (component, groupId, filterAction)
            values ('${component}', ${groupId}, ${filterAction.valueOf()})
        `)
        .then(result => result.lastID);
    }

    static update(id: number, component: string, groupId: number, filterAction: FilterAction): Promise<number> {
        return Db.run(`
            update domain 
            set component='${component}', 
            groupId=${groupId},
            filterAction=${filterAction.valueOf()}
            where id=${id}
        `)
        .then(result => result.changes);
    }

    static getById(id: number): Promise<DomainFilter | null> {
        return Db.get(`
            select * from domain
            where id = ${id}
        `)
        .then((result:any) => result ? new DomainFilter(
            result.id, 
            result.component, 
            result.groupId,
            result.filterAction) : null);
    }

    static getFromDomainNameAndGroup(domainName: string, groupId: number): Promise<DomainFilter | null> {
        let spl = Helpers.replaceAll(domainName,".", "','");
        return Db.get(`
            select * from domain
            where groupId = ${groupId} and component in ('${spl}') 
        `)
        .then((result: any) => result ? new DomainFilter(
            result.id, 
            result.component, 
            result.groupId,
            result.filterAction) : null);
    }

    static delete(id: number): Promise<number> {
        return Db.run(`
            delete from domain
            where id = ${id}
        `)
        .then((result: RunResult) => result.changes);
    }

    static getAll(): Promise<DomainFilter[]> {
        return Db.all(`
            select * from domain
        `)
        .then((result: any) => result.map((r:any) => new DomainFilter(
            r.id, 
            r.component, 
            r.groupId,
            r.filterAction)))
    }

}