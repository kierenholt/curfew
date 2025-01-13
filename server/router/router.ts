import { IPAddress } from "../IPAddress";
import { Keywords } from "../keyword/keywords";
import { RouterFilter } from "./routerFilter";
import { VirginSession } from "./virgin";
import { OidEnabledType, OidType } from "./virginOids";

export enum RouterModel {
    Unknown = 0,
    Virgin = 1
}

export class Router {
    static foundRouter: RouterModel = RouterModel.Unknown;

    static async detect(): Promise<void> {
        console.log(". searching for router");
        this.foundRouter = (await this.HTTPFileExists(VirginSession.virginMediaIcon)) ? RouterModel.Virgin : RouterModel.Unknown;
        console.log("✓ success");

        if (this.foundRouter == RouterModel.Unknown) {
            throw ("unable to communicate with router");
        }
    }

    static async resetFilters(): Promise<void> {
        let session = new VirginSession();

        let f = await session.getActiveFilters();
        await session.hardReset();

        let blockedIps = await Keywords.getBlockedIPs();
        console.log(". updating IP filters configured on router");
        await Router.updateBlockedIPs(blockedIps, () => null, session);
        console.log("✓ success");
        await session.logout();
    }

    static async disableDHCP(): Promise<void> {
        let session = new VirginSession();

        //let result = await session.walkOidTest("1.3.6.1.4.1.4115.1.20.1.1.2.2.1.9");

        console.log(". disabling DHCP on router");
        let DCHPIsEnabled = (await session.getOidValue(OidType.DHCPIsEnabled)) == OidEnabledType.Enabled;
        if (DCHPIsEnabled) {
            await session.setOidValue(OidType.DHCPIsEnabled, OidEnabledType.Disabled);
            DCHPIsEnabled = (await session.getOidValue(OidType.DHCPIsEnabled)) == OidEnabledType.Enabled;
            if (DCHPIsEnabled) {
                throw ("unable to turn off DHCP on router");
            }
        }
        await session.logout();
        console.log("✓ success");
    }

    static async updateBlockedIPs(ips: string[], updateProgress: (message: string, isSuccess: boolean) => void, session: VirginSession): Promise<void> {
        let routerFilters = await session.getActiveFilters();

        let currentlyBlocked = routerFilters.map(f => f.dest.toString());
        let ipsToCreate = ips.filter(ip => currentlyBlocked.indexOf(ip) == -1);
        for (let i = 0; i < ipsToCreate.length; i++) {
            //create a filter
            console.log(`. creating filter ${i + 1} of ${ipsToCreate.length}`);
            updateProgress(`. creating filter for ${i + 1} of ${ipsToCreate.length}`, false);
            let newIndex = routerFilters.length + i + 1;
            let newFilter = new RouterFilter(newIndex.toString(), IPAddress.fromString(ipsToCreate[i]));
            await session.setFilter(newFilter);
        }

        let filtersToDelete = routerFilters.filter(f => ips.indexOf(f.dest.toString()) == -1);
        console.log(`. deleting ${filtersToDelete.length} filters`);
        updateProgress(`. deleting ${filtersToDelete.length} filters`, false);
        await session.deleteFilters(filtersToDelete.map(f => f.index));
        updateProgress("✓ success", true);
        await session.logout();
    }

    static HTTPFileExists(url: string): Promise<boolean> {
        return fetch(url).then(response => response.ok);
    }
}