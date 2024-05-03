import { Answer } from "./answer";
import { DomainName } from "./domainName";


describe("Question2", () => {

    test('write to buffer then read', () => {

        let a1 = new Answer(new DomainName("www.google.co.uk"),2,77,86400,15,"ooooolllllfffff");
        let b1 = Buffer.alloc(a1.byteLength);
        a1.writeToBuffer(b1, 0);

        let obj = Answer.fromBuffer(b1, 0);
        expect(a1.equals(obj.a)).toBeTruthy();
    })
}
)