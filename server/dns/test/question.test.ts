const test = require('node:test');
import assert from "node:assert";

import { Question } from "../question";
import { DomainName } from "../domainName";



test('write to buffer then read', () => {

    let q1 = new Question(new DomainName("www.google.co.uk"), 2, 77);
    let b1 = Buffer.alloc(1024);
    q1.writeToBuffer(b1, 0, {});

    let [question, i] = Question.fromBuffer(b1, 0);
    assert(q1.equals(question));
})