const test = require('node:test');
import assert from "node:assert";
import { IPAddress } from "./IPAddress";
import { Helpers } from "./helpers";

test('from and to hex', () => {
    let hex = "c0a80000";
    let ip = IPAddress.fromHex(hex);
    let hex2 = ip.toHex();
    assert.equal(hex, hex2);
})

test('from and to ipaddress', () => {
    let hex = "192.168.3.4";
    let ip = IPAddress.fromString(hex);
    let hex2 = ip.toString();
    assert.equal(hex, hex2);
})



test('to hex', () => {
    let string = "192.168.0.1";
    let ip = IPAddress.fromString(string);
    assert.equal("c0a80001", ip.toHex());
})


test('to hex', () => {
    let string = "7.7.7.7";
    let ip = IPAddress.fromString(string);
    assert.equal("07070707", ip.toHex());
})


test('from string', () => {
    let string = "7.7.7.7";
    let ip = IPAddress.fromString(string);
    assert.equal("07070707", ip.toHex());
})

test('trim', () => {
    let chaff = "$$$";
    let withFront = "$$$12345";
    let withBack = "12345$$$";
    let withBoth = "$$$12345$$$";
    assert.equal(Helpers.trim(withFront, chaff), "12345")
    assert.equal(Helpers.trim(withBack, chaff), "12345")
    assert.equal(Helpers.trim(withBoth, chaff), "12345")
})

