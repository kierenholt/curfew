import { Helpers } from "../../utility/helpers";
import { IPFilter } from "../ipFilter";
import { PortFilter } from "../portFilter";
import { RouterBase } from "../routerBase";

export class TestHappyRouter extends RouterBase {
    _isDHCPEnabled: boolean = false;
    _IPFilters: IPFilter[] = [];
    _PortFilters: PortFilter[] = [];

    hasLoginPage(): Promise<boolean> {
        console.log("mock router: checking login page");
        return Promise.resolve(true);
    }

    isDHCPEnabled(): Promise<boolean> {
        console.log("mock router: checking DHCP");
        return Promise.resolve(this._isDHCPEnabled);
    }

    setDHCPEnabled(value: boolean): Promise<void> {
        console.log("mock router: setting DHCP to " + value);
        this._isDHCPEnabled = value;
        return Promise.resolve();
    }

    applyAllSettings(): Promise<void> {
        console.log("mock router: applying all settings");
        return Promise.resolve();
    }

    login(): Promise<boolean> {
        console.log("mock router: logging in");
        return Promise.resolve(true);
    }

    logout(): Promise<void> {
        console.log("mock router: logging out");
        return Promise.resolve();
    }

    getActiveFilters(): Promise<(IPFilter | PortFilter)[]> {
        console.log("mock router: getting active filters");
        return Promise.resolve([...this._IPFilters, ...this._PortFilters]);
    }

    deleteAllFilters(): Promise<void> {
        console.log("mock router: deleting all filters");
        this._IPFilters = [];
        this._PortFilters = [];
        return Promise.resolve();
    }

    setFilter(newFilter: IPFilter | PortFilter): Promise<void> {
        console.log("mock router: setting filter");
        if (newFilter instanceof IPFilter) {
            this._IPFilters.push(newFilter);
            Helpers.removeDuplicates(this._IPFilters);
        }
        if (newFilter instanceof PortFilter) {
            this._PortFilters.push(newFilter);
            Helpers.removeDuplicates(this._PortFilters);
        }
        return Promise.resolve();
    }
} 