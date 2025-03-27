const test = require('node:test');
import { TestHappyRouter } from "./testHappyRouter";
import { RouterBase } from "../routerBase";
import { RouterTester } from "../RouterTester";

let router = new TestHappyRouter() as RouterBase;
let routerTester = new RouterTester(router);

test('finds home page', () => {
    routerTester.findsCorrectHomePage();
})

test('has correct password', () => {
    routerTester.hasCorrectPassword();
})

test('turns DHCP on and off', async () => {
    routerTester.turnsDHCPOnOff();
})

test('deletes all filters', async () => {
    routerTester.deletesAllFilters();
})

test('adds an IP filter', async () => {
    routerTester.addsAnIpFilter();
})

test('adds a port filter', async () => {
    routerTester.addsAPortFilter();
})

test('adds some mixed filters then deletes them all', async () => {
    routerTester.addSomeFiltersDeletesThemAll();
})

test('adds 10 IP filters then deletes them all', async () => {
    routerTester.addsGivenNumberOfIPFilters(10);
})

test('adds 10 port filters then deletes them all', async () => {
    routerTester.addsGivenNumberOfPortFilters(10);
})