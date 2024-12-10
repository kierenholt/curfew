import { ActiveSearchTerms } from "../searchTerm/activeTerms";

export enum RedirectDestination {
    app = 1, hole = 0, shortTTL = 2, passThrough = 3
}

export class Redirector {
    static async redirectTo(hostAddress: string, fullDomain: string = ""): Promise<RedirectDestination> {

        if (hostAddress.length == 0) {
            console.error("hostAddress should not be null");
            return RedirectDestination.hole;
        }

        //do not save if request is curfew - keep the last status
        //going to app
        if (fullDomain.toLowerCase() == (process.env.HOSTNAME as string).toLowerCase()) {
            return RedirectDestination.app;
        }

        //curfew.0.0.168.192.in-addr.arpa
        if (fullDomain.endsWith("in-addr.arpa") && fullDomain.startsWith((process.env.HOSTNAME as string).toLowerCase())) {
            return RedirectDestination.app;
        }

        if (Number(process.env.BYPASS_ALL)) {
            return RedirectDestination.passThrough;
        }

        if (ActiveSearchTerms.isDomainBlocked(fullDomain)) {
            return RedirectDestination.hole;
        }

        return RedirectDestination.shortTTL;
    }
}