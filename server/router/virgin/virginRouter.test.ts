const test = require('node:test');
import { RouterBase } from "../routerBase";
import { RouterTester } from "../RouterTester";
import { VirginRouter } from "./virginRouter";
import * as dotenv from "dotenv";

dotenv.config();

/***
 * THIS TEST REQUIRES ENV SETTINGS:
 *  PASSWORD: string e.g. iL1keT0ast
 *  ROUTER_IP: string, e.g. 192.168.0.1
 *  FULL_NETWORK: string e.g. 192.168.0.0
 */

if (process.env.PASSWORD == undefined || process.env.ROUTER_IP == undefined || process.env.FULL_NETWORK == undefined) {
    throw("missing env file - please define PASSWORD, ROUTER_IP and FULL_NETWORK");
}

let router = new VirginRouter({ 
    password: process.env.PASSWORD as string, 
    routerIp: process.env.ROUTER_IP as string, 
    fullNetwork: process.env.FULL_NETWORK as string }) as RouterBase;
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