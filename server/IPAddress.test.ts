const test = require('node:test');
import assert from "node:assert";
import { IPAddress } from "./IPAddress";

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