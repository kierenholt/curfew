import { Cache } from "./cache";
import { Socket } from "dgram";
import { DnsPacket as DnsPacket } from "./dnsPacket";
import { Answer } from "./answer";
import { DnsResponseDb } from "./dnsResponseDb";
const dgram = require('dgram');

export class DnsForwarder {
    cache: Cache;
    socket: Socket;
    TTL: number = 30;
    port: number = 53;
    resolvesById: any = {};
    passThroughResolvesById: any = {};

    constructor(socket: Socket) {
        this.cache = new Cache();
        this.socket = socket;
    }

    processResponse(responsePacket: DnsPacket, responseBuffer: Buffer) {   
        //check for passthrough
        let passThroughResolve = this.passThroughResolvesById[responsePacket.header.id]; 
        if (passThroughResolve) {
            delete(this.passThroughResolvesById[responsePacket.header.id]);
            passThroughResolve(responseBuffer);
            return;
        }
        
        //add to cache
        responsePacket.allAnswers.forEach(a => a.ttl = this.TTL);
        this.cache.upsert(responsePacket.questions[0], responsePacket.allAnswers);

        //write to db
        let answer = responsePacket.allAnswers[0];
        if (answer) DnsResponseDb.create(answer.domainName.name, answer.IPAddress, new Date().valueOf())

        //resolve promise
        let foundPromiseResolve = this.resolvesById[responsePacket.header.id];
        if (foundPromiseResolve) {
            delete(this.resolvesById[responsePacket.header.id]);
            foundPromiseResolve(responsePacket.allAnswers);
        }
    }

    forward(requestBuffer: Buffer): Promise<Answer[]> {
        let requestPacket = DnsPacket.fromBuffer(requestBuffer);

        let cached: Answer[] = this.cache.getAnswers(requestPacket.questions[0]);
        if (cached) {
            return Promise.resolve(cached);
        }

        return new Promise((resolve, reject) => {
            this.socket.send(requestBuffer, this.port, process.env.DNS_UPSTREAM, (error: any) => {
                if (error) {
                    console.error('Error sending message:', error);
                    this.socket.close();
                } 
                else {
                    //console.log(JSON.stringify(requestBuffer));
                    this.resolvesById[requestPacket.header.id] = (ans: Answer[]) => resolve(ans);
                }
            });
        });
    }

    passThrough(requestBuffer: Buffer): Promise<Buffer> {
        let requestPacket = DnsPacket.fromBuffer(requestBuffer);
        
        return new Promise((resolve, reject) => {
            this.socket.send(requestBuffer, this.port, process.env.DNS_UPSTREAM, (error: any) => {
                if (error) {
                    console.error('Error sending message:', error);
                    this.socket.close();
                } 
                else {
                    //console.log(JSON.stringify(requestBuffer));
                    this.passThroughResolvesById[requestPacket.header.id] = (buf: Buffer) => resolve(buf);
                }
            });
        });
    }
}