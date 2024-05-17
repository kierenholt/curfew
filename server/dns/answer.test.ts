import { Answer } from "./answer";
import { DomainName } from "./domainName";


describe("Question2", () => {

    test('write to buffer then read', () => {

        let a1 = new Answer(new DomainName("www.google.co.uk"),2,77,86400,3,Buffer.from([133,122,111]));
        let b1 = Buffer.alloc(1024);
        a1.writeToBuffer(b1, 0, {});

        let obj = Answer.fromBuffer(b1, 0);
        expect(a1.equals(obj.a)).toBeTruthy();
    })
}
)