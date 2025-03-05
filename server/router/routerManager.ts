import { Helpers } from "../helpers";
import { IPAddress } from "../IPAddress";
import { Keywords } from "../keyword/keywords";
import { IPFilter } from "./ipFilter";
import { PortFilter } from "./portFilter";
import { IRouter } from "./iRouter";
import { VirginSession } from "./virgin/virginSession";

export class RouterManager {
    router: IRouter;

    constructor(router: IRouter) {
        this.router = router;
    }

    static async detect(routerIp: string): Promise<void> {
        console.log(". searching for router");
        let virginExists = await RouterManager.HTTPFileExists(VirginSession.staticFile(routerIp));
        
        if (!virginExists) {
            throw ("unable to communicate with router");
        }
        console.log("✓ success");
    }

    async checkPassword(): Promise<boolean> {
        try {
            console.log(". checking password");
            await this.router.login();
            await this.router.logout();
        }
        catch (ex) {
            console.log("x password check failed - please login and set it");
            return false;
        }
        console.log("✓ success");
        return true;
    }

    async resetFilters(): Promise<void> {
        let f = await this.router.getActiveFilters();
        await this.router.deleteAllFilters();

        let [blockedIps, ports] = await Keywords.getBlockedIPsAndPorts();
        console.log(". updating IP filters configured on router");
        await this.updateBlockedIPsAndPorts(blockedIps, ports, () => null);
        console.log("✓ success");
        await this.router.logout();
    }

    async disableDHCP(): Promise<void> {
        console.log(". disabling DHCP on router");
        let DCHPIsEnabled = await this.router.isDHCPEnabled();
        if (DCHPIsEnabled) {
            await this.router.setDHCPEnabled(false);
            await this.router.applyAllSettings;
            DCHPIsEnabled = await this.router.isDHCPEnabled();
            if (DCHPIsEnabled) {
                throw ("unable to turn off DHCP on router");
            }
        }
        await this.router.logout();
        console.log("✓ success");
    }

    async updateBlockedIPsAndPorts(ips: string[], ports: number[], updateProgress: (message: string, isSuccess: boolean) => void): Promise<void> {
        await this.router.deleteAllFilters();

        //ips
        for (let i = 0; i < ips.length; i++) {
            //create a filter
            console.log(`. creating ip filter ${i + 1} of ${ips.length}`);
            updateProgress(`. creating ip filter for ${i + 1} of ${ips.length}`, false);
            let newIndex = i + 1;
            let newFilter = new IPFilter(newIndex.toString(), IPAddress.fromString(ips[i]));
            await this.router.setFilter(newFilter);
        }
        
        //ports
        for (let i = 0; i < ports.length; i++) {
            //create a filter
            console.log(`. creating port filter ${i + 1} of ${ports.length}`);
            updateProgress(`. creating port filter for ${i + 1} of ${ports.length}`, false);
            let newIndex = ips.length + i + 1;
            let newFilter = new PortFilter(newIndex.toString(), ports[i]);
            await this.router.setFilter(newFilter);
        }
        await this.router.applyAllSettings()

        updateProgress("✓ success", true);
        await this.router.logout();
    }

    static HTTPFileExists(url: string): Promise<boolean> {
        return Helpers.retryForever(() => fetch(url).then(response => response.ok));
    }
}