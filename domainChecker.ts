

export class DomainChecker {
    blackList: string[] = ["youtube","googlevideo","roblox","classroom6x","tiktok","unity","snapchat","goguardian","-tiktok","unity3d","classroom6x","goguardian","classroom6x","tiktokcdn","facebook","brawlstars","tiktokcdn-eu","tiktokv","apple","aaplimg","brawlstargame","brawlstarsgame","brawlstars","vungle","gameduo","liftoff","applovin","inner-activ","inmobicdn","inmobi","applvn","tiktokcdn-us","stats","ocsp","supercell","rbxcdn","crazygames","epicgames","epicgames","yohoho","poki","1001games","friv","numuki","coolmathgames","raft-wars","ytimg","fbcdn","brawlstars","snapchat"];
    constructor() {

    }

    isAllowed(fullDomain: string): boolean {
        return this.blackList.indexOf(fullDomain) != -1;
    }


}