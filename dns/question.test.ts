import { Question } from "./question";
import { DomainName } from "./domainName";



describe("Question2", () => {
    test('write to buffer then read', () => {

        let q1 = new Question(new DomainName("www.google.co.uk"),2,77);
        let b1 = Buffer.alloc(q1.byteLength);
        q1.writeToBuffer(b1, 0);

        let obj = Question.fromBuffer(b1, 0);
        expect(q1.equals(obj.q)).toBeTruthy();
    })
}
)