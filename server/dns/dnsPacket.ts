import { IWriteToBuffer } from "../python/unicast";
import { Answer } from "./answer";
import { Header } from "./header";
import { Question } from "./question";

export interface HasUID {
    cacheUID: string;
}

export class DnsPacket implements IWriteToBuffer {

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
        let obj: any = Header.fromBuffer(buf, 0);
        let header = obj.h;
        let questions = [];
        for(let i = 0; i < header.qdcount; i++){
            obj = Question.fromBuffer(buf, obj.i);
            questions.push(obj.q);
        }
        let answers = [];
        for(let i=0; i < header.ancount; i++){
            obj = Answer.fromBuffer(buf, obj.i);
            answers.push(obj.a);
        }
        let authorities = [];
        for(let i=0; i < header.nscount; i++){
            obj = Answer.fromBuffer(buf, obj.i);
            authorities.push(obj.a);
        }
        let additionals = [];
        for(let i=0; i < header.arcount; i++){
            obj = Answer.fromBuffer(buf, obj.i);
            additionals.push(obj.a);
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

    static fromObject(obj: any) {
        return new DnsPacket(
            Header.fromObject(obj.header),
            obj.questions.map((o:any) => Question.fromObject(o)),
            obj.answers.map((o:any) => Answer.fromObject(o)),
            obj.authorities.map((o:any) => Answer.fromObject(o)),
            obj.additionals.map((o:any) => Answer.fromObject(o)),
        )
    }

    get allAnswers(): Answer[] {
        return [...this.answers, ...this.authorities];
    }

    addAnswers(a: Answer[]) {
        this.answers.push(...a);
        this.header.ancount += a.length;
    }

    equals(p: DnsPacket): boolean {
        return this.header.equals(p.header) &&
            this.answers.every(a1 => p.answers.some(a2 => a2.equals(a1)));
    }
}