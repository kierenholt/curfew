import { Answer } from "./answer";
import { DomainName } from "./domainName";


describe("domain name", () => {

    test('write to buffer then read', () => {

        let a1 = new DomainName("www.google.co.uk");
        let b1 = Buffer.alloc(1024);
        a1.writeToBuffer(b1, 0, {});

        let obj = DomainName.fromBuffer(b1, 0);
        expect(a1.equals(obj.d)).toBeTruthy();
    })
}
)