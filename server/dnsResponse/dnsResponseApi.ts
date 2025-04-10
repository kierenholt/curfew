import express, { Express, Request, Response } from 'express';
import { CurfewDb } from '../db';

export class DnsResponseApi {
    
    static init(app: Express, db: CurfewDb) {        
        app.get('/api/dns-response/all', async (req: Request, res: Response) => {
            let ret = await db.dnsResponseQuery.getAll();
            res.status(200).json(ret);
        });
    }
}