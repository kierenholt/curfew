import { IPAddress } from "./IPAddress";
import { Keywords } from "../keyword/keywords";
import { IPFilter } from "./ipFilter";
import { PortFilter } from "./portFilter";

export abstract class RouterBase {

    async exists(): Promise<void> {
        console.log(". searching for router");
        let virginExists = await this.hasLoginPage();
        
        if (!virginExists) {
            throw ("unable to communicate with router");
        }
        console.log("✓ success");
    }

    async checkPassword(): Promise<boolean> {
        try {
            console.log(". checking password");
            await this.login();
            await this.logout();
        }
        catch (ex) {
            console.log("x password check failed - please login and set it");
            return false;
        }
        console.log("✓ success");
        return true;
    }

    async resetFilters(): Promise<void> {
        let f = await this.getActiveFilters();
        await this.deleteAllFilters();

        let [blockedIps, ports] = await Keywords.getBlockedIPsAndPorts();
        console.log(". updating IP filters configured on router");
        await this.updateBlockedIPsAndPorts(blockedIps, ports, () => null);
        console.log("✓ success");
        await this.logout();
    }

    async disableDHCP(): Promise<void> {
        console.log(". disabling DHCP on router");
        let DCHPIsEnabled = await this.isDHCPEnabled();
        if (DCHPIsEnabled) {
            await this.setDHCPEnabled(false);
            await this.applyAllSettings;
            DCHPIsEnabled = await this.isDHCPEnabled();
            if (DCHPIsEnabled) {
                throw ("unable to turn off DHCP on router");
            }
        }
        await this.logout();
        console.log("✓ success");
    }

    async updateBlockedIPsAndPorts(ips: string[], ports: number[], updateProgress: (message: string, isSuccess: boolean) => void): Promise<void> {
        await this.deleteAllFilters();

        //ips
        for (let i = 0; i < ips.length; i++) {
            //create an ip filter
            console.log(`. creating ip filter ${i + 1} of ${ips.length}`);
            updateProgress(`. creating ip filter for ${i + 1} of ${ips.length}`, false);
            let newIndex = i + 1;
            let newFilter = new IPFilter(newIndex.toString(), IPAddress.fromString(ips[i]));
            await this.setFilter(newFilter);
        }
        
        //ports
        for (let i = 0; i < ports.length; i++) {
            //create a port filter
            console.log(`. creating port filter ${i + 1} of ${ports.length}`);
            updateProgress(`. creating port filter for ${i + 1} of ${ports.length}`, false);
            let newIndex = ips.length + i + 1;
            let newFilter = new PortFilter(newIndex.toString(), ports[i]);
            await this.setFilter(newFilter);
        }
        await this.applyAllSettings()

        updateProgress("✓ success", true);
        await this.logout();
    }

    abstract isDHCPEnabled(): Promise<boolean>;
    abstract setDHCPEnabled(value: boolean): Promise<void>;
    abstract applyAllSettings(): Promise<void>;
    abstract login(): Promise<boolean>;
    abstract logout(): Promise<void>;
    abstract getActiveFilters(): Promise<(IPFilter | PortFilter)[]>;
    abstract deleteAllFilters(): Promise<void>;
    abstract setFilter(newFilter: IPFilter | PortFilter): Promise<void>;
    abstract hasLoginPage(): Promise<boolean>;
}