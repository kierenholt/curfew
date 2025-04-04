const test = require('node:test');
import { RouterBase } from "../routerBase";
import { RouterTester } from "../RouterTester";
import { MX4200 } from "./mx4200";
import * as dotenv from "dotenv";

dotenv.config();

/***
 * THIS TEST REQUIRES ENV SETTINGS:
 *  PASSWORD: string e.g. iL1keT0ast
 *  ROUTER_IP: string, e.g. 192.168.0.1
 *  FULL_NETWORK: string e.g. 192.168.0.0
 */

if (process.env.PASSWORD == undefined || process.env.ROUTER_IP == undefined || process.env.FULL_NETWORK == undefined) {
    //throw("missing env file - please define PASSWORD, ROUTER_IP and FULL_NETWORK");
}

let router = new MX4200({ 
    password: "6Us=drVkhf.p'>~", 
    routerIp: "192.168.1.1", 
    fullNetwork: "192.168.1.0" }) as RouterBase;
let routerTester = new RouterTester(router);

test('finds home page', async () => {
    await routerTester.findsCorrectHomePage();
})

test('has correct password', async () => {
    await routerTester.hasCorrectPassword();
})

test('turns DHCP on and off', async () => {
    await routerTester.turnsDHCPOnOff();
})

test('deletes all filters', async () => {
    await routerTester.deletesAllFilters();
})

test('adds an IP filter', async () => {
    await routerTester.addsAnIpFilter();
})

test('adds a port filter', async () => {
    await routerTester.addsAPortFilter();
})

test('adds some mixed filters then deletes them all', async () => {
    await routerTester.addSomeFiltersDeletesThemAll();
})

test('adds 10 IP filters then deletes them all', async () => {
    await routerTester.addsGivenNumberOfIPFilters(10);
})

test('adds 10 port filters then deletes them all', async () => {
    await routerTester.addsGivenNumberOfPortFilters(10);
})