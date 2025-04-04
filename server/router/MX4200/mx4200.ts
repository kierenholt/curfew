import { Helpers } from "../../utility/helpers";
import { IPFilter } from "../ipFilter";
import { PortFilter } from "../portFilter";
import { IPAddress } from "../IPAddress";
import { RouterBase } from "../routerBase";
import { RouterOptions } from "../routerProvider";

export class MX4200 extends RouterBase {

    password: string;
    ipAddress: string;
    fullNetworkAsHex: string;

    constructor(options: RouterOptions) {
        super();
        this.password = options.password;
        this.ipAddress = options.routerIp;
        this.fullNetworkAsHex = IPAddress.fromString(options.fullNetwork).toHex();
    }

    async hasLoginPage(): Promise<boolean> {
        return await Helpers.HTTPFileExists(`http://${this.ipAddress}/ui/1.0.99.210200/static/cache/images/topnav/linksys_smart_wifi_logo.png`);
    }
    
    async login(password: string = this.password): Promise<void> {
        let payload = {"adminPassword":password};
        let action = "http://linksys.com/jnap/core/CheckAdminPassword3";
        return Helpers.retryForever(() => this.fetchPayload(payload, action))
        .then(response => {
            if (response.ok) {
                return response.json()
            }
            throw ("error in checking password " + response.statusText);
        })
        .then(obj => {
            if (!obj.output.isPasswordValid) {
                throw("password is not valid");
            }
        })
    }

    fetchPayload(payload: any, action: string): Promise<Response> {
        let fetchOptions = {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-JNAP-Authorization': 'Basic ' + Buffer.from(`admin:${this.password}`).toString('base64'),
                'X-JNAP-Action': action
            },
            body: JSON.stringify(payload)
        };
        return fetch(`http://${this.ipAddress}/JNAP/`, fetchOptions);
    }

    getNumIPFilters(): Promise<number> {
        
        return Promise.resolve(1);
    }


    async setFilter(filter: IPFilter | PortFilter): Promise<void> {
        return Promise.resolve();
    }

    deleteFilters(indexes: string[]): Promise<void> {
        return Promise.resolve();
    }

    async deleteAllFilters() {
        let numFilters = await this.getNumIPFilters();
        console.log(`. hard deleting all ${numFilters} filters`);
        let range = Helpers.range(numFilters, 0);
        await this.deleteFilters(range.map(i => i.toString()));
        console.log("✓ success");
    }

    async logout(): Promise<void> {
        
        return Promise.resolve();
    }

    get isLoggedIn() {
        return Promise.resolve();
    }

    getActiveFilters(): Promise<(IPFilter | PortFilter)[]> {
        return Promise.resolve([]);
        
    }

    async isDHCPEnabled(): Promise<boolean> {
        return Promise.resolve(true);
        
    }

    async setDHCPEnabled(value: boolean): Promise<void> {
        return Promise.resolve();
        
    }

    async applyAllSettings(): Promise<void> {
        return Promise.resolve();
    }

}