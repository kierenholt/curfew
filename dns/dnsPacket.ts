import { Helpers } from "../helpers";
import { Answer } from "./answer";
import { Header } from "./header";
import { Question } from "./question";

export interface HasUID {
    cacheUID: string;
}

export class DnsPacket2 {

    header: Header;
    questions: Question[] = [];
    answers: Answer[] = [];
    authorities: Answer[] = [];
    additionals: Answer[] = [];

    constructor(header: Header, questions: Question[], answers: Answer[], authorities: Answer[], additionals: Answer[]) {
        this.header = header;
        this.questions = questions;
        this.answers = answers;
        this.authorities = authorities;
        this.additionals = additionals;
    }

    static fromBuffer(buf: Buffer): DnsPacket2 {
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
            answers.push(obj.r);
        }
        let authorities = [];
        for(let i=0; i < header.nscount; i++){
            obj = Answer.fromBuffer(buf, obj.i);
            authorities.push(obj.r);
        }
        let additionals = [];
        for(let i=0; i < header.arcount; i++){
            obj = Answer.fromBuffer(buf, obj.i);
            additionals.push(obj.r);
        }
        return new DnsPacket2(header, questions, answers, authorities, additionals);
    }

    writeToBuffer(): Buffer {
        let buf = Buffer.alloc(this.byteLength);
        let i = this.header.writeToBuffer(buf, 0);
        for (let q of this.questions) {
            i = q.writeToBuffer(buf, i);
        }
        for (let a of this.answers) {
            i = a.writeToBuffer(buf, i);
        }
        for (let a of this.authorities) {
            i = a.writeToBuffer(buf, i);
        }
        for (let a of this.additionals) {
            i = a.writeToBuffer(buf, i);
        }
        return buf;
    }

    get cacheUID(): string {
        return `${this.questions[0].qclass}:${this.questions[0].qname}:${this.questions[0].qtype}`;
    }

    get byteLength():number {
        return this.header.byteLength + 
            Helpers.sum(this.questions.map(q => q.byteLength)) +
            Helpers.sum(this.answers.map(q => q.byteLength)) +
            Helpers.sum(this.authorities.map(q => q.byteLength)) +
            Helpers.sum(this.additionals.map(q => q.byteLength));
    }
}