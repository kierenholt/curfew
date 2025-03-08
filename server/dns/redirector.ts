import { CurfewDb } from "../db";

export enum RedirectDestination {
    app = 1, hole = 0, shortTTL = 2, passThrough = 3, ignore = 4
}

export class Redirector {
    db: CurfewDb;
    constructor(db: CurfewDb) {
        this.db = db;
    }

    async decide(hostAddress: string, fullDomain: string = ""): Promise<RedirectDestination> {

        if (hostAddress.length == 0) {
            console.error("hostAddress should not be null");
            return RedirectDestination.hole;
        }

        //do not save if request is curfew - keep the last status
        //going to app
        if (fullDomain.toLowerCase() == (process.env.HOSTNAME as string).toLowerCase() ||
            fullDomain.toLowerCase() == `${(process.env.HOSTNAME as string)}.local`.toLowerCase()) {
            return RedirectDestination.app;
        }

        if (fullDomain.endsWith("in-addr.arpa") && fullDomain.startsWith((process.env.HOSTNAME as string).toLowerCase())) {
            return RedirectDestination.hole;
        }

        if (fullDomain.endsWith("in-addr.arpa")) {
            if (fullDomain.startsWith((process.env.HOSTNAME as string).toLowerCase())) {
                //curfew.0.0.168.192.in-addr.arpa
                return RedirectDestination.app;
            }
            //78.0.168.192.in-addr.arpa //reverse lookups - wants to know our domain name
            return RedirectDestination.ignore;
        }

        if (Number(process.env.BYPASS_ALL)) {
            return RedirectDestination.passThrough;
        }

        if (await this.db.keywordQuery.isDomainBlocked(fullDomain)) {
            return RedirectDestination.hole;
        }

        return RedirectDestination.shortTTL;
    }
}