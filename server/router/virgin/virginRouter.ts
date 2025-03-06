import { Helpers } from "../../helpers";
import { IPFilter } from "../ipFilter";
import { PortFilter } from "../portFilter";
import { OidEnabledType, OidType, VirginOidBase, VirginWalkOid } from "./virginOids";
import { IPAddress } from "../IPAddress";
import { RouterBase } from "../routerBase";

export class VirginRouter extends RouterBase {

    nonce: string;
    cookie: string = "";
    name = "admin";
    password: string;
    ipAddress: string;
    fullNetworkAsHex: string;

    constructor(password: string, ipAddress: string, fullNetworkAsHex: string) {
        super();
        this.nonce = Math.random().toString().substring(2, 7);
        this.password = password;
        this.ipAddress = ipAddress;
        this.fullNetworkAsHex = fullNetworkAsHex;
    }

    async hasLoginPage(): Promise<boolean> {
        return await Helpers.HTTPFileExists(`http://${this.ipAddress}/skins/vm/css/images/logo-VirginMedia.png`);
    }
    
    async login(): Promise<boolean> {
        this.nonce = Math.random().toString().substring(2, 7);
        var up = Buffer.from(encodeURIComponent(this.name) + ":" + Buffer.from(encodeURIComponent(this.password))).toString('base64');
        var query = `arg=${up}&` + this.nonceAndDate;
        return Helpers.retryForever(() => fetch(`http://${this.ipAddress}/login?` + query))
            .then(response => {
                if (response.ok) {
                    return response.text()
                        .then(text => {
                            if (text.indexOf("Timeout") == -1) {
                                this.cookie = text;
                                return true;
                            }
                            else { //timeout or other error
                                throw ("unable to login: " + text + " - check the password?");
                            }
                        });
                }
                else {
                    throw ("login bad response: " + response.statusText)
                }
            })
    }

    getNumIPFilters(): Promise<number> {
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
        return Helpers.retryForever(() => fetch(`http://${this.ipAddress}/walk?oids=` + query, this.cookieHeader))
            .then(response => response.json());
    }

    async setFilter(filter: IPFilter | PortFilter): Promise<void> {
        if (filter instanceof IPFilter) {
            let types = [OidType.IpVer, OidType.Direction, OidType.ProtoType,
                OidType.SrcRange, OidType.SrcStartAddr, OidType.SrcEndAddr, OidType.SrcPrefixLen,
                OidType.DstRange, OidType.DstStartAddr, OidType.DstEndAddr, OidType.DstPrefixLen,
                OidType.SrcPortStart, OidType.SrcPortEnd, OidType.DstPortStart, OidType.DstPortEnd,
                OidType.Action, OidType.RowStatus
                ];
                let values: string[] = ["1", "1", "3",
                    "1", 
                    "%24" + this.fullNetworkAsHex,
                    "%24" + this.fullNetworkAsHex,
                    "0",
                    "2", 
                    "%24" + filter.dest.toHex(), 
                    "%2400000000", 
                    "0",
                    "", "", 
                    "", "",
                    "1", OidEnabledType.Enabled
                ];
                return this.setBulkOidTypes(types, values, filter.index);
        }
        if (filter instanceof PortFilter) {
            let types = [OidType.IpVer, OidType.Direction, OidType.ProtoType,
                OidType.SrcRange, OidType.SrcStartAddr, OidType.SrcEndAddr, OidType.SrcPrefixLen,
                OidType.DstRange, OidType.DstStartAddr, OidType.DstEndAddr, OidType.DstPrefixLen,
                OidType.SrcPortStart, OidType.SrcPortEnd, OidType.DstPortStart, OidType.DstPortEnd,
                OidType.Action, OidType.RowStatus
                ];
                let values: string[] = ["1", "1", 
                    "2", "1",
                    "%24" + this.fullNetworkAsHex,
                    "%24" + this.fullNetworkAsHex,
                    "0",
                    "1",
                    "undefined",
                    "undefined",
                    "0",
                    "1", "65535",
                    filter.port.toString(), filter.port.toString(),
                    "1", OidEnabledType.Enabled
                ];
                return this.setBulkOidTypes(types, values, filter.index);
        }
    }

    deleteFilters(indexes: string[]): Promise<void> {
        return this.setBulkOidIndexes(OidType.RowStatus, OidEnabledType.ToDelete, indexes);
    }

    async deleteAllFilters() {
        let numFilters = await this.getNumIPFilters();
        console.log(`. hard deleting all ${numFilters} filters`);
        let range = Helpers.range(numFilters, 0);
        await this.deleteFilters(range.map(i => i.toString()));
        console.log("✓ success");
    }

    async logout(): Promise<void> {
        if (!this.isLoggedIn) return;
        let query = this.nonceAndDate;
        return Helpers.retryForever(() => fetch(`http://${this.ipAddress}/logout?` + query, this.cookieHeader))
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

    get isLoggedIn() {
        return this.cookie != "";
    }

    getActiveFilters(): Promise<(IPFilter | PortFilter)[]> {
        return this.walkOid(OidType.WalkPortFiltering)
            .then(obj => VirginRouter.fromOidWalkResult(obj));
    }

    async isDHCPEnabled(): Promise<boolean> {
        return this.getOidValue(OidType.DHCPIsEnabled)
            .then(result => result == OidEnabledType.Enabled);
    }

    async setDHCPEnabled(value: boolean): Promise<void> {
        return this.setOidValue(OidType.DHCPIsEnabled, value ? OidEnabledType.Enabled : OidEnabledType.Disabled);
    }

    async applyAllSettings(): Promise<void> {
        return this.setOidValue(OidType.ApplyAllSettings, 1, "0");
    }

    //private methods
    private async getOidValue(type: OidType, index: string = ""): Promise<any> {
        if (!this.isLoggedIn) await this.login();
        let oid: VirginOidBase = VirginOidBase.create(type, index);
        let query = oid.getQuery() + "&" + this.nonceAndDate;
        return Helpers.retryForever(() => fetch(`http://${this.ipAddress}/snmpGet?oids=` + query, this.cookieHeader))
            .then(response => {
                if (response.ok) {
                    return response.json()
                }
                throw ("error in get oid " + response.statusText);
            })
            .then(obj => oid.convertResponseObjectToValue(obj));
    }

    private async setOidValue(type: OidType, value: any, index: string = ""): Promise<void> {
        if (!this.isLoggedIn) await this.login();
        let oid: VirginOidBase = VirginOidBase.create(type, index);
        let query = oid.setQuery(value) + "&" + this.nonceAndDate;
        return Helpers.retryForever(() => fetch(`http://${this.ipAddress}/snmpSet?oids=` + query, this.cookieHeader))
            .then(response => {
                if (!response.ok) throw ("set failed");
            });
    }

    //used to create a filter
    private async setBulkOidTypes(types: OidType[], values: string[], index: string): Promise<void> {
        if (!this.isLoggedIn) await this.login();
        let oids: VirginOidBase[] = types.map(t => VirginOidBase.create(t, index));
        let queries = oids.map((o, i) => o.setQuery(values[i]));
        let fullQuery = queries.join("\\n") + "\\n&" + this.nonceAndDate;
        return Helpers.retryForever(() => fetch(`http://${this.ipAddress}/snmpSetBulk?oids=` + fullQuery, this.cookieHeader))
            .then(response => {
                if (!response.ok) throw ("set failed");
            });
    }

    //used to delete multiple filter
    private async setBulkOidIndexes(type: OidType, value: string, indexes: string[]): Promise<void> {
        if (!this.isLoggedIn) await this.login();
        let oids: VirginOidBase[] = indexes.map(i => VirginOidBase.create(type, i));
        let queries = oids.map((o, i) => o.setQuery(value));
        let fullQuery = queries.join("\\n") + "\\n&" + this.nonceAndDate;
        return Helpers.retryForever(() => fetch(`http://${this.ipAddress}/snmpSetBulk?oids=` + fullQuery, this.cookieHeader))
            .then(response => {
                if (!response.ok) throw ("set failed");
            });
    }

    private get nonceAndDate() {
        return `_n=${this.nonce}&_=${new Date().valueOf().toString()}`;
    }

    private get cookieHeader() {
        return {
            headers: {
                "Cookie": "credential=" + this.cookie,
            }
        }
    }

    static fromOidWalkResult(obj: any): (IPFilter | PortFilter)[] {
        let sortedByIndex: any = {};
        for (let key in obj) {
            let [oid, index] = VirginRouter.splitWalkResultKey(key);
            if (oid) {
                if (!(index in sortedByIndex)) {
                    sortedByIndex[index] = {};
                }
                sortedByIndex[index][oid] = obj[key];
            }
        }

        let ret: (IPFilter | PortFilter)[] = [];
        for (let key in sortedByIndex) {
            let obj = sortedByIndex[key];

            let trimmedDest = Helpers.trim(obj[OidType.DstStartAddr],"$");
            if (IPAddress.isValid(trimmedDest)) {
                ret.push(new IPFilter(key, IPAddress.fromHex(trimmedDest)));
            }
            
            let port = obj[OidType.DstPortStart];
            if (Number(port) > 0) {
                ret.push(new PortFilter(key, port));
            }
        }
        return ret;
    }

    static splitWalkResultKey(key: string) {
        let spl = key.split(".");
        let index = spl[spl.length - 1];
        let oid = spl.slice(0, -1).join(".");
        return [oid, index];
    }
}