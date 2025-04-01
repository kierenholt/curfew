const test = require('node:test');
import assert from "node:assert";
import { Header } from "../header";


test('write to buffer then read', () => {

    let h1 = new Header(12345, 1, 1, 0, 0, 7);
    let b1 = Buffer.alloc(1024);
    h1.writeToBuffer(b1, 0);

    let [header, i] = Header.fromBuffer(b1, 0);
    assert(h1.equals(header));
})
