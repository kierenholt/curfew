import { RedirectReasonInfo } from "./redirectReason";

export class Redirector {
    blackList: string[] = ["youtube","googlevideo","roblox","classroom6x","tiktok","unity","snapchat","goguardian","-tiktok","unity3d","classroom6x","goguardian","classroom6x","tiktokcdn","facebook","brawlstars","tiktokcdn-eu","tiktokv","apple","aaplimg","brawlstargame","brawlstarsgame","brawlstars","vungle","gameduo","liftoff","applovin","inner-activ","inmobicdn","inmobi","applvn","tiktokcdn-us","stats","ocsp","supercell","rbxcdn","crazygames","epicgames","epicgames","yohoho","poki","1001games","friv","numuki","coolmathgames","raft-wars","ytimg","fbcdn","brawlstars","snapchat"];
    static requestsByIP: { [IP: string]: RedirectReasonInfo | null; } = {};
    static TIME_TO_LIVE_MS: number = 1000;

    static async redirectTo(hostAddress: string, fullDomain: string = ""): Promise<RedirectReasonInfo> {
        let ret = await RedirectReasonInfo.create(hostAddress, fullDomain);
        this.requestsByIP[hostAddress] = ret;
        return ret;
    }

    static getRequestReason(IP: string): RedirectReasonInfo | null {
        let found = this.requestsByIP[IP];
        if (found && found.createdOn.valueOf() + this.TIME_TO_LIVE_MS < new Date().valueOf()) {
            this.requestsByIP[IP] = null;
            return null;
        }
        return found;
    }
}