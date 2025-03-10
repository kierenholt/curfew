import { Helpers } from "../../utility/helpers";
import { IPFilter } from "../ipFilter";
import { PortFilter } from "../portFilter";
import { RouterBase } from "../routerBase";

export class TestHappyRouter extends RouterBase {
    _isDHCPEnabled: boolean = false;
    _IPFilters: IPFilter[] = [];
    _PortFilters: PortFilter[] = [];

    hasLoginPage(): Promise<boolean> {
        return Promise.resolve(true);
    }

    isDHCPEnabled(): Promise<boolean> {
        return Promise.resolve(this._isDHCPEnabled);
    }

    setDHCPEnabled(value: boolean): Promise<void> {
        this._isDHCPEnabled = value;
        return Promise.resolve();
    }

    applyAllSettings(): Promise<void> {
        return Promise.resolve();
    }

    login(): Promise<boolean> {
        return Promise.resolve(true);
    }

    logout(): Promise<void> {
        return Promise.resolve();
    }

    getActiveFilters(): Promise<(IPFilter | PortFilter)[]> {
        return Promise.resolve([...this._IPFilters, ...this._PortFilters]);
    }

    deleteAllFilters(): Promise<void> {
        this._IPFilters = [];
        this._PortFilters = [];
        return Promise.resolve();
    }

    setFilter(newFilter: IPFilter | PortFilter): Promise<void> {
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