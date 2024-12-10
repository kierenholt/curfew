import { Helpers } from "../helpers";
import { IPAddress } from "../IPAddress";
import { SettingDb, SettingKey } from "../settings/settingDb";
import { RouterFilter } from "./routerFilter";
import { VirginSession } from "./virgin";
import { OidEnabledType, OidType } from "./virginOids";

export enum RouterModel {
    Unknown = 0,
    Virgin = 1
}

export class Router {
    static foundRouter: RouterModel = RouterModel.Unknown;
    static activeFilters: RouterFilter[] = [];

    static async init(): Promise<void> {
        this.foundRouter = (await this.HTTPFileExists(VirginSession.virginMediaIcon)) ? RouterModel.Virgin : RouterModel.Unknown;

        if (this.foundRouter == RouterModel.Unknown) {
            throw("unable to communicate with router");
        }

        let session = new VirginSession();
        await session.login();

        // let DCHPIsEnabled = await session.getOidValue(OidType.DHCPIsEnabled) == OidEnabledType.Enabled;
        // if (DCHPIsEnabled) {
        //     await session.setOidValue(OidType.DHCPIsEnabled, OidEnabledType.Disabled);
        // }
        // DCHPIsEnabled = await session.getOidValue(OidType.DHCPIsEnabled) == OidEnabledType.Enabled;
        // if (DCHPIsEnabled) {
        //     throw("unable to turn off DHCP on router");
        // }

        this.activeFilters = await session.getActiveFilters();
                
        await session.logout()
    }
    
    static async updateBlockedIPs(ips: string[]): Promise<void> {
        let session = new VirginSession();
        await session.login();
        this.activeFilters = await session.getActiveFilters();
        
        let currentlyBlocked = this.activeFilters.map(f => f.dest.toString());
        for (let ip of ips) {
            if (currentlyBlocked.indexOf(ip) == -1) { //needs adding
                //create a filter
                let newIndex = this.activeFilters.length + 1;
                let newFilter = new RouterFilter(newIndex.toString(), IPAddress.fromString(ip));
                await session.setFilter(newFilter);
                this.activeFilters.push(newFilter);                
            }
        }
        
        for (let f of this.activeFilters) {
            if (ips.indexOf(f.dest.toString()) == -1) { //needs deleting
                //delete a filter
                await session.deleteFilter(f.index);
                Helpers.removeAllFromArray(f, this.activeFilters);
            }
        }

        await session.logout();
    }

    static HTTPFileExists(url: string): Promise<boolean> {
        return fetch(url).then(response => response.ok);
    }

}