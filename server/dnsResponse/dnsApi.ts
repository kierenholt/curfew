import express, { Express, Request, Response } from 'express';
import { CurfewDb } from '../db';

export class DnsApi {
    
    static init(app: Express, db: CurfewDb) {        
        app.get('/api/dns-response/all', async (req: Request, res: Response) => {
            let ret = await db.dnsQuery.getAllResponsesWithFlags();
            res.status(200).json(ret);
        });

        app.post('/api/domain/flagged/', async (req: Request, res: Response) => {
            if (req.body.domain && !isNaN(req.body.value)) {
                let ret = await db.dnsQuery.setDomainFlagged(req.body.domain, req.body.value);
                res.status(200).json(true);
            }
            else {
                res.status(400).send("parameter error");
            }
        });

        app.post('/api/domain/hidden/', async (req: Request, res: Response) => {
            if (req.body.domain && !isNaN(req.body.value)) {
                let ret = await db.dnsQuery.setDomainHidden(req.body.domain, req.body.value);
                res.status(200).json(true);
            }
            else {
                res.status(400).send("parameter error");
            }
        });
    }
}