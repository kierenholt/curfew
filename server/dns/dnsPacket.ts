import { Helpers } from "../utility/helpers";
import { Answer } from "./answer";
import { Header } from "./header";
import { Question, RecordType } from "./question";

export interface HasUID {
    cacheUID: string;
}

export class DnsPacket {

    header: Header;
    questions: Question[] = [];
    answers: Answer[] = [];
    authorities: Answer[] = [];
    additionals: Answer[] = [];

    constructor(header: Header,
        questions: Question[],
        answers: Answer[] = [],
        authorities: Answer[] = [],
        additionals: Answer[] = []) {
        this.header = header;
        this.questions = questions;
        this.answers = answers;
        this.authorities = authorities;
        this.additionals = additionals;
    }

    static fromBuffer(buf: Buffer): DnsPacket {        
        let [header, i] = Header.fromBuffer(buf, 0);
        let questions = [];
        for(let q = 0, question; q < header.qdcount; q++){
            [question, i] = Question.fromBuffer(buf, i);
            questions.push(question);
        }
        let answers = [];
        for(let a = 0, answer; a < header.ancount; a++){
            [answer, i] = Answer.fromBuffer(buf, i);
            answers.push(answer);
        }
        let authorities = [];
        for(let b = 0, authority; b < header.nscount; b++){
            [authority, i] = Answer.fromBuffer(buf, i);
            authorities.push(authority);
        }
        let additionals = [];
        for(let c = 0, additional; c < header.arcount; c++){
            [additional, i] = Answer.fromBuffer(buf, i);
            additionals.push(additional);
        }
        return new DnsPacket(header, questions, answers, authorities, additionals);
    }

    writeToBuffer(): Buffer {
        let buf = Buffer.alloc(1024);
        let cache = {};
        let i = this.header.writeToBuffer(buf, 0);
        for (let q of this.questions) {
            i = q.writeToBuffer(buf, i, cache);
        }
        for (let a of this.answers) {
            i = a.writeToBuffer(buf, i, cache);
        }
        for (let a of this.authorities) {
            i = a.writeToBuffer(buf, i, cache);
        }
        for (let a of this.additionals) {
            i = a.writeToBuffer(buf, i, cache);
        }
        return buf.subarray(0,i);
    }

    get allAnswers(): Answer[] {
        return [...this.answers, ...this.authorities];
    }

    addAnswers(a: Answer[]) {
        this.answers.push(...a);
        this.header.ancount += a.length;
    }

    addAdditionals(a: Answer[]) {
        this.additionals.push(...a);
        this.header.arcount += a.length;
    }

    equals(p: DnsPacket): boolean {
        return this.header.equals(p.header) &&
            this.answers.every(a1 => p.answers.some(a2 => a2.equals(a1)));
    }

    findARecord(): string | null {
        let As = this.answers.filter(a => a.type == RecordType.A);
        if (As.length > 0) {
            return As[0].IPAddressOrCName;
        }
        return null;
    }

    dropIPv6Answers() {
        this.answers = this.answers.filter(a => a.type != RecordType.AAAA);
        this.header.ancount = this.answers.length;
    }
}