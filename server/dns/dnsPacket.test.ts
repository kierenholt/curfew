import { Answer } from "./answer";
import { DnsPacket } from "./dnsPacket";
import { DomainName } from "./domainName";
import { Header } from "./header";
import { Question } from "./question";


const bytes = [64,139,129,128,0,1,0,6,0,0,0,0,3,119,119,119,7,110,101,116,102,108,105,120,3,99,111,109,0,0,1,0,1,192,12,0,5,0,1,0,0,1,43,0,13,3,119,119,119,6,100,114,97,100,105,115,192,16,192,45,0,5,0,1,0,0,0,59,0,25,3,119,119,119,9,101,117,45,119,101,115,116,45,49,8,105,110,116,101,114,110,97,108,192,49,192,70,0,5,0,1,0,0,0,59,0,71,44,97,112,105,112,114,111,120,121,45,119,101,98,115,105,116,101,45,110,108,98,45,112,114,111,100,45,51,45,97,99,49,49,48,102,54,97,101,52,55,50,98,56,53,97,3,101,108,98,9,101,117,45,119,101,115,116,45,49,9,97,109,97,122,111,110,97,119,115,192,24,192,107,0,1,0,1,0,0,0,59,0,4,3,251,50,149,192,107,0,1,0,1,0,0,0,59,0,4,54,155,178,5,192,107,0,1,0,1,0,0,0,59,0,4,54,74,73,31];

describe("DNsPacket", () => {

    test('write then read', () => {
        let p = new DnsPacket(
            new Header(1,0,1,1,0,0),
            [new Question(new DomainName("www.google.co.uk"),1,1)],
            [new Answer(new DomainName("www.google.co.uk"),1,1,1,0,Buffer.from([]))]
        )
        let b = p.writeToBuffer();
        let p2 = DnsPacket.fromBuffer(b);
        expect(p.equals(p2)).toBeTruthy();
    });

    test('read from buffer', () => {
        let b1 = Buffer.from(bytes);
        let p1 = DnsPacket.fromBuffer(b1);
        let b2 = p1.writeToBuffer();
        let p2 = DnsPacket.fromBuffer(b2);

        expect(p1.equals(p2));
    });
    
    
}
)