import { IPAddress } from "./IPAddress";
import { IPFilter } from "./ipFilter";
import { PortFilter } from "./portFilter";

export abstract class RouterBase {
    async isPasswordCorrect(password?: string): Promise<boolean> {
        try {
            await this.login(password);
            await this.logout();
        }
        catch (ex) {
            return false;
        }
        return true;
    }

    async disableDHCPIfEnabled(): Promise<void> {
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

    async applyBlockedIPsAndPorts(ipAndPorts: [string[], number[]], 
        updateProgress: (message: string, isSuccess: boolean) => void = () => null): Promise<void> {
        await this.deleteAllFilters();
        let [ips, ports] = ipAndPorts;
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
    abstract login(password?: string): Promise<boolean>;
    abstract logout(): Promise<void>;
    abstract getActiveFilters(): Promise<(IPFilter | PortFilter)[]>;
    abstract deleteAllFilters(): Promise<void>;
    abstract setFilter(newFilter: IPFilter | PortFilter): Promise<void>;
    abstract hasLoginPage(): Promise<boolean>;
}