import { Helpers } from "../helpers";
import { SettingDb, SettingKey } from "../settings/settingDb";
import { RouterFilter } from "./routerFilter";
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
        return fetch("http://192.168.0.1/login?" + query)
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
        return fetch("http://192.168.0.1/snmpGet?oids=" + query, this.cookieHeader)
            .then(response => {
                if (response.ok) {
                    return response.json()
                }
                throw ("error in get oid " + response.statusText);
            })
            .then(obj => oid.convertResponseObjectToValue(obj));
    }

    getActiveFilters(): Promise<RouterFilter[]> {
        return this.walkOid(OidType.WalkPortFiltering);
    }

    async walkOidTest(oid: string): Promise<any> {
        if (!this.isLoggedIn) await this.login();
        let query = oid + "&" + this.nonceAndDate;
        return fetch("http://192.168.0.1/walk?oids=" + query, this.cookieHeader)
            .then(response => response.json());
    }

    async walkOid(type: OidType): Promise<RouterFilter[]> {
        if (!this.isLoggedIn) await this.login();
        let oid: VirginOidBase = VirginOidBase.create(type);
        if (!(oid instanceof VirginWalkOid)) {
            throw ("cannot run walk query on oid of wrong type");
        }
        let query = oid.getQuery() + "&" + this.nonceAndDate;
        return fetch("http://192.168.0.1/walk?oids=" + query, this.cookieHeader)
            .then(response => response.json())
            .then(obj => oid.convertResponseObjectToValue(obj));
    }

    async setOidValue(type: OidType, value: any, index: string = ""): Promise<string> {
        if (!this.isLoggedIn) await this.login();
        let oid: VirginOidBase = VirginOidBase.create(type, index);
        let query = oid.setQuery(value) + "&" + this.nonceAndDate;
        return fetch("http://192.168.0.1/snmpSet?oids=" + query, this.cookieHeader)
            .then(response => {
                return response.text()
            });
    }

    setFilter(filter: RouterFilter): Promise<boolean> {
        let [types, values, index] = filter.oidsAndValuesForCreate;
        return this.setBulkOidTypes(types, values, index);
    }

    deleteFilters(indexes: string[]): Promise<boolean> {
        return this.setBulkOidIndexes(OidType.RowStatus, OidEnabledType.ToDelete, indexes);
    }

    async hardReset() {
        for (let i = 40; i >= 0; i -= 10) {
            console.log(`. hard deleting filters ${i + 10} to ${i + 1}`);
            let range = Helpers.range(i + 10, i);
            await this.deleteFilters(range.map(i => i.toString()));
        }
        console.log("✓ success");
    }

    //used to create a filter
    // DO NOT TRY TO READ THE RESPONSE
    async setBulkOidTypes(types: OidType[], values: string[], index: string): Promise<boolean> {
        if (!this.isLoggedIn) await this.login();
        let oids: VirginOidBase[] = types.map(t => VirginOidBase.create(t, index));
        let queries = oids.map((o, i) => o.setQuery(values[i]));
        let fullQuery = queries.join("\\n") + "\\n&" + this.nonceAndDate;
        return fetch("http://192.168.0.1/snmpSetBulk?oids=" + fullQuery, this.cookieHeader)
            .then(response => response.ok);
    }

    //used to delete multiple filter
    // DO NOT TRY TO READ THE RESPONSE
    async setBulkOidIndexes(type: OidType, value: string, indexes: string[]): Promise<boolean> {
        if (!this.isLoggedIn) await this.login();
        let oids: VirginOidBase[] = indexes.map(i => VirginOidBase.create(type, i));
        let queries = oids.map((o, i) => o.setQuery(value));
        let fullQuery = queries.join("\\n") + "\\n&" + this.nonceAndDate;
        return fetch("http://192.168.0.1/snmpSetBulk?oids=" + fullQuery, this.cookieHeader)
            .then(response => response.ok);
    }

    async logout(): Promise<void> {
        if (!this.isLoggedIn) return;
        let query = this.nonceAndDate;
        return fetch("http://192.168.0.1/logout?" + query, this.cookieHeader)
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
}