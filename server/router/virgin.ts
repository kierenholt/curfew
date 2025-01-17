import { Helpers } from "../helpers";
import { SettingDb, SettingKey } from "../settings/settingDb";
import { IFilter } from "./iFilter";
import { IPFilter } from "./ipFilter";
import { OidWalkGroup } from "./oidWalkGroup";
import { PortFilter } from "./portFilter";
import { OidEnabledType, OidType, VirginOidBase, VirginWalkOid } from "./virginOids";

export class VirginSession {

    static virginMediaIcon = "http://192.168.0.1/skins/vm/css/images/logo-VirginMedia.png";
    browser: any;
    nonce: string;
    cookie: string = "";
    name = "admin";

    constructor() {
        this.nonce = Math.random().toString().substring(2, 7);
    }

    async login(): Promise<boolean> {
        let password = await SettingDb.getString(SettingKey.routerAdminPassword);
        var up = Buffer.from(encodeURIComponent(this.name) + ":" + Buffer.from(encodeURIComponent(password))).toString('base64');
        var query = `arg=${up}&` + this.nonceAndDate;
        return Helpers.retryForever(() => fetch("http://192.168.0.1/login?" + query))
            .then(response => {
                if (response.ok) {
                    return response.text()
                        .then(text => {
                            if (text.indexOf("Timeout") == -1) {
                                this.cookie = text;
                                return true;
                            }
                            else { //timeout or other error
                                throw ("unable to login: " + text)
                            }
                        });
                }
                else {
                    throw ("login bad response: " + response.statusText)
                }
            })
    }

    async getOidValue(type: OidType, index: string = ""): Promise<any> {
        if (!this.isLoggedIn) await this.login();
        let oid: VirginOidBase = VirginOidBase.create(type, index);
        let query = oid.getQuery() + "&" + this.nonceAndDate;
        return Helpers.retryForever(() => fetch("http://192.168.0.1/snmpGet?oids=" + query, this.cookieHeader))
            .then(response => {
                if (response.ok) {
                    return response.json()
                }
                throw ("error in get oid " + response.statusText);
            })
            .then(obj => oid.convertResponseObjectToValue(obj));
    }

    getNumFilters(): Promise<number> {
        return this.walkOid(OidType.WalkPortFiltering)
            .then(obj => {
                let ret = 0;
                for (let key in obj) {
                    if (key.startsWith(OidType.IpVer + ".")) { ret++ }
                }
                return ret;
            });
    }

    async walkOid(type: OidType): Promise<any> {
        if (!this.isLoggedIn) await this.login();
        let oid: VirginOidBase = VirginOidBase.create(type);
        if (!(oid instanceof VirginWalkOid)) {
            throw ("cannot run walk query on oid of wrong type");
        }
        let query = oid.getQuery() + "&" + this.nonceAndDate;
        return Helpers.retryForever(() => fetch("http://192.168.0.1/walk?oids=" + query, this.cookieHeader))
            .then(response => response.json());
    }

    async setOidValue(type: OidType, value: any, index: string = ""): Promise<void> {
        if (!this.isLoggedIn) await this.login();
        let oid: VirginOidBase = VirginOidBase.create(type, index);
        let query = oid.setQuery(value) + "&" + this.nonceAndDate;
        return Helpers.retryForever(() => fetch("http://192.168.0.1/snmpSet?oids=" + query, this.cookieHeader))
            .then(response => {
                if (!response.ok) throw ("set failed");
            });
    }

    setFilter(filter: IFilter): Promise<void> {
        let [types, values, index] = filter.oidsAndValues();
        return this.setBulkOidTypes(types, values, index);
    }

    deleteFilters(indexes: string[]): Promise<void> {
        return this.setBulkOidIndexes(OidType.RowStatus, OidEnabledType.ToDelete, indexes);
    }

    async deleteAllFilters() {
        let numFilters = await this.getNumFilters();
        console.log(`. hard deleting all ${numFilters} filters`);
        let range = Helpers.range(numFilters, 0);
        await this.deleteFilters(range.map(i => i.toString()));
        console.log("✓ success");
    }

    //used to create a filter
    // DO NOT TRY TO READ THE RESPONSE
    async setBulkOidTypes(types: OidType[], values: string[], index: string): Promise<void> {
        if (!this.isLoggedIn) await this.login();
        let oids: VirginOidBase[] = types.map(t => VirginOidBase.create(t, index));
        let queries = oids.map((o, i) => o.setQuery(values[i]));
        let fullQuery = queries.join("\\n") + "\\n&" + this.nonceAndDate;
        return Helpers.retryForever(() => fetch("http://192.168.0.1/snmpSetBulk?oids=" + fullQuery, this.cookieHeader))
            .then(response => {
                if (!response.ok) throw ("set failed");
            });
    }

    //used to delete multiple filter
    // DO NOT TRY TO READ THE RESPONSE
    async setBulkOidIndexes(type: OidType, value: string, indexes: string[]): Promise<void> {
        if (!this.isLoggedIn) await this.login();
        let oids: VirginOidBase[] = indexes.map(i => VirginOidBase.create(type, i));
        let queries = oids.map((o, i) => o.setQuery(value));
        let fullQuery = queries.join("\\n") + "\\n&" + this.nonceAndDate;
        return Helpers.retryForever(() => fetch("http://192.168.0.1/snmpSetBulk?oids=" + fullQuery, this.cookieHeader))
            .then(response => {
                if (!response.ok) throw ("set failed");
            });
    }

    async logout(): Promise<void> {
        if (!this.isLoggedIn) return;
        let query = this.nonceAndDate;
        return Helpers.retryForever(() => fetch("http://192.168.0.1/logout?" + query, this.cookieHeader))
            .then(response => {
                if (response.status == 500) {
                    this.cookie = "";
                    return
                }
                else {
                    throw ("logout failed" + response.statusText)
                }
            });
    }

    get nonceAndDate() {
        return `_n=${this.nonce}&_=${new Date().valueOf().toString()}`;
    }

    get cookieHeader() {
        return {
            headers: {
                "Cookie": "credential=" + this.cookie,
            }
        }
    }

    get isLoggedIn() {
        return this.cookie != "";
    }

    getActiveFilters(): Promise<[IPFilter[], PortFilter[]]> {
        return this.walkOid(OidType.WalkPortFiltering)
            .then(obj => this.fromOidWalkResult(obj));
    }

    fromOidWalkResult(obj: any): [IPFilter[], PortFilter[]] {
        let sortedByIndex: any = {};
        for (let key in obj) {
            let [oid, index] = this.splitWalkResultKey(key);
            if (oid) {
                if (!(index in sortedByIndex)) {
                    sortedByIndex[index] = {};
                }
                sortedByIndex[index][oid] = obj[key];
            }
        }

        let ipFilters: IPFilter[] = [];
        let portFilters: PortFilter[] = [];
        for (let key in sortedByIndex) {
            let group = new OidWalkGroup(sortedByIndex[key], key);
            if (group.isValid) {
                let ipFilter = group.toIpFilter();
                let portFilter = group.toPortFilter();
                if (ipFilter != null) ipFilters.push(ipFilter as IPFilter);
                if (portFilter != null) portFilters.push(portFilter as PortFilter);
            }
        }
        return [ipFilters, portFilters];
    }

    splitWalkResultKey(key: string) {
        let spl = key.split(".");
        let index = spl[spl.length - 1];
        let oid = spl.slice(0, -1).join(".");
        return [oid, index];
    }
}