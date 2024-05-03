import { Header } from "./header";


describe("Header2", () => {
    test('write to buffer then read', () => {

        let h1 = new Header(12345, 1, 1, 0, 0, 7);
        let b1 = Buffer.alloc(h1.byteLength);
        h1.writeToBuffer(b1, 0);

        let obj = Header.fromBuffer(b1, 0);
        expect(h1.equals(obj.h)).toBeTruthy();
    })
}
)