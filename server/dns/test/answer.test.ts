const test = require('node:test');
import assert from "node:assert";
import { Answer } from "../answer";
import { DomainName } from "../domainName";



test('write to buffer then read', () => {

    let a1 = new Answer(new DomainName("www.google.co.uk"), 2, 77, 86400, 3, Buffer.from([133, 122, 111]));
    let b1 = Buffer.alloc(1024);
    a1.writeToBuffer(b1, 0, {});

    let [answer, i] = Answer.fromBuffer(b1, 0);
    assert(a1.equals(answer));
})
