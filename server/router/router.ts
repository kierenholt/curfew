import { IPAddress } from "../IPAddress";
import { Keywords } from "../keyword/keywords";
import { IPFilter } from "./ipFilter";
import { PortFilter } from "./portFilter";
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
        await session.deleteAllFilters();

        let [blockedIps, ports] = await Keywords.getBlockedIPsAndPorts();
        console.log(". updating IP filters configured on router");
        await Router.updateBlockedIPsAndPorts(blockedIps, ports, () => null, session);
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
            await session.setOidValue(OidType.ApplyAllSettings, 1);
            DCHPIsEnabled = (await session.getOidValue(OidType.DHCPIsEnabled)) == OidEnabledType.Enabled;
            if (DCHPIsEnabled) {
                throw ("unable to turn off DHCP on router");
            }
        }
        await session.logout();
        console.log("✓ success");
    }

    static async updateBlockedIPsAndPorts(ips: string[], ports: number[], updateProgress: (message: string, isSuccess: boolean) => void, session: VirginSession): Promise<void> {
        await session.deleteAllFilters();

        //ips
        for (let i = 0; i < ips.length; i++) {
            //create a filter
            console.log(`. creating ip filter ${i + 1} of ${ips.length}`);
            updateProgress(`. creating ip filter for ${i + 1} of ${ips.length}`, false);
            let newIndex = i + 1;
            let newFilter = new IPFilter(newIndex.toString(), IPAddress.fromString(ips[i]));
            await session.setFilter(newFilter);
        }
        
        //ports
        for (let i = 0; i < ports.length; i++) {
            //create a filter
            console.log(`. creating port filter ${i + 1} of ${ports.length}`);
            updateProgress(`. creating port filter for ${i + 1} of ${ports.length}`, false);
            let newIndex = ips.length + i + 1;
            let newFilter = new PortFilter(newIndex.toString(), ports[i]);
            await session.setFilter(newFilter);
        }

        updateProgress("✓ success", true);
        await session.logout();
    }

    static HTTPFileExists(url: string): Promise<boolean> {
        return fetch(url).then(response => response.ok);
    }
}