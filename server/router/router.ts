import { Helpers } from "../helpers";
import { IPAddress } from "../IPAddress";
import { Keywords } from "../keyword/keywords";
import { RouterFilter } from "./routerFilter";
import { VirginSession } from "./virgin";
import { OidEnabledType, OidType } from "./virginOids";
var systemctl = require('systemctl')

export enum RouterModel {
    Unknown = 0,
    Virgin = 1
}

export class Router {
    static foundRouter: RouterModel = RouterModel.Unknown;

    static async setupDHCP(): Promise<void> {
        console.log(". searching for router");
        this.foundRouter = (await this.HTTPFileExists(VirginSession.virginMediaIcon)) ? RouterModel.Virgin : RouterModel.Unknown;
        console.log("✓ success");

        if (this.foundRouter == RouterModel.Unknown) {
            throw ("unable to communicate with router");
        }

        console.log(". checking dhcp service");
        let enabled = await systemctl.isEnabled('isc-dhcp-server');
        if (!enabled) throw ("isc dhcp server must be running as a service");
        console.log("✓ success");

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
        console.log("✓ success");

        let f = await session.getActiveFilters();
        //await session.hardReset();
        
        let blockedIps = await Keywords.getBlockedIPs();
        console.log(". updating IP filters configured on router");
        await Router.updateBlockedIPs(blockedIps, session);
        console.log("✓ success");
        await session.logout();
    }

    static async updateBlockedIPs(ips: string[], session: VirginSession = new VirginSession()): Promise<void> {
        let routerFilters = await session.getActiveFilters();

        let currentlyBlocked = routerFilters.map(f => f.dest.toString());
        let ipsToCreate = ips.filter(ip => currentlyBlocked.indexOf(ip) == -1);
        for (let i = 0; i < ipsToCreate.length; i++) {
            //create a filter
            console.log(`. creating filter for ip address ${i + 1} of ${ipsToCreate.length}`);
            let newIndex = routerFilters.length + i + 1;
            let newFilter = new RouterFilter(newIndex.toString(), IPAddress.fromString(ipsToCreate[i]));
            await session.setFilter(newFilter);
        }

        let filtersToDelete = routerFilters.filter(f => ips.indexOf(f.dest.toString()) == -1);
        console.log(`. deleting ${filtersToDelete.length} filters`);
        await session.deleteFilters(filtersToDelete.map(f => f.index));
        await session.logout();
    }

    static HTTPFileExists(url: string): Promise<boolean> {
        return fetch(url).then(response => response.ok);
    }
}