import assert from "node:assert";
import { RouterBase } from "./routerBase";
import { IPFilter } from "./ipFilter";
import { IPAddress } from "./IPAddress";
import { PortFilter } from "./portFilter";
import { Helpers } from "../utility/helpers";


export class RouterTester {
    router: RouterBase;
    constructor(router: RouterBase) {
        this.router = router;
    }

    async findsCorrectHomePage() {
        assert(await this.router.hasLoginPage());
        await this.router.logout();
    }

    async hasCorrectPassword() {
        assert(await this.router.isPasswordCorrect());
        await this.router.logout();
    }

    async turnsDHCPOnOff() {
        await this.router.setDHCPEnabled(false);
        assert(!await this.router.isDHCPEnabled());
        await this.router.setDHCPEnabled(true);
        assert(await this.router.isDHCPEnabled());
        await this.router.logout();
    }

    async deletesAllFilters() {
        await this.router.deleteAllFilters();

        let filters = await this.router.getActiveFilters();
        assert(filters.length == 0);
        await this.router.logout();
    }

    async addsAnIpFilter() {
        let filter0 = new IPFilter("1", IPAddress.fromString('11.12.13.14'));

        await this.router.deleteAllFilters();

        await this.router.setFilter(filter0);
        let filters = await this.router.getActiveFilters();
        assert(filters.length == 1);
        assert(Helpers.betterIncludes(filters, filter0));
        await this.router.logout();
    }

    async addsAPortFilter() {
        let filter0 = new PortFilter("1", [7777, 7778]); // index must be "1" or greater

        await this.router.deleteAllFilters();

        await this.router.setFilter(filter0);
        let filters = await this.router.getActiveFilters();
        assert(Helpers.betterIncludes(filters, filter0));
        await this.router.logout();
    }

    async addSomeFiltersDeletesThemAll() {
        let filter0 = new IPFilter("1", IPAddress.fromString('11.12.13.14'));
        let filter1 = new PortFilter("2", [4343, 4344]);
        let filter2 = new IPFilter("3", IPAddress.fromString('1.3.7.9'));
        let filter3 = new PortFilter("4", [7777, 7777]);
        let filter4 = new IPFilter("5", IPAddress.fromString('255.255.255.1'));

        await this.router.deleteAllFilters();

        await this.router.setFilter(filter0);
        await this.router.setFilter(filter1);
        await this.router.setFilter(filter2);
        await this.router.setFilter(filter3);
        await this.router.setFilter(filter4);

        let filters = await this.router.getActiveFilters();
        assert(filters.length == 5);
        assert(Helpers.betterIncludes(filters, filter0));
        assert(Helpers.betterIncludes(filters, filter1));
        assert(Helpers.betterIncludes(filters, filter2));
        assert(Helpers.betterIncludes(filters, filter3));
        assert(Helpers.betterIncludes(filters, filter4));

        await this.router.deleteAllFilters();

        filters = await this.router.getActiveFilters();
        assert(filters.length == 0);
        await this.router.logout();
    }

    async addsGivenNumberOfIPFilters(n: number) {
        let expectedFilters = Helpers.range(1, n).map(n => new IPFilter(n.toString(), IPAddress.fromHex(n.toString(16))));
        await this.router.deleteAllFilters();

        expectedFilters.forEach(async f => await this.router.setFilter(f));
        let actualFilters = await this.router.getActiveFilters();
        assert(actualFilters.length == n);
        for (let f of expectedFilters) {
            assert(Helpers.betterIncludes(actualFilters, f));
        }
        await this.router.logout();
    }

    async addsGivenNumberOfPortFilters(n: number) {
        let expectedFilters = Helpers.range(1, n).map(n => new PortFilter(n.toString(), [1000 + n, 1000 + n]));
        await this.router.deleteAllFilters();

        expectedFilters.forEach(async f => await this.router.setFilter(f));
        let actualFilters = await this.router.getActiveFilters();
        assert(actualFilters.length == n);
        for (let f of expectedFilters) {
            assert(Helpers.betterIncludes(actualFilters, f));
        }
        await this.router.logout();
    }
}