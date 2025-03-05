import { IPFilter } from "./ipFilter";
import { PortFilter } from "./portFilter";

export interface IRouter {
    isDHCPEnabled(): Promise<boolean>;
    setDHCPEnabled(value: boolean): Promise<void>;
    applyAllSettings(): Promise<void>;
    login(): Promise<boolean>;
    logout(): Promise<void>;
    getActiveFilters(): Promise<(IPFilter | PortFilter)[]>;
    deleteAllFilters(): Promise<void>;
    setFilter(newFilter: IPFilter | PortFilter): Promise<void>;
}