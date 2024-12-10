const test = require('node:test');
import assert from "node:assert";

import { Answer } from "../answer";
import { DomainName } from "../domainName";


test('write to buffer then read', () => {

    let a1 = new DomainName("www.google.co.uk");
    let b1 = Buffer.alloc(1024);
    a1.writeToBuffer(b1, 0, {});

    let obj = DomainName.fromBuffer(b1, 0);
    assert(a1.equals(obj.d));
})