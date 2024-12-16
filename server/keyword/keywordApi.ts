import express, { Express, Request, Response } from 'express';
import { KeywordDb } from './keywordDb';
import { Keywords } from './keywords';
import { Router } from '../router/router';

export class KeywordApi {
    static init(app: Express) {

        // //get all
        app.get('/api/keywords', async (req: Request, res: Response) => {
            let ret = await KeywordDb.getAll();
            res.status(200).json(ret);
        });

        app.get('/api/keyword/:id', async (req: Request, res: Response) => {
            let id = Number(req.params.id);
            if (req.params.id.length > 0) {
                let ret = await KeywordDb.getById(id);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        });

        //set active / inactive
        app.put('/api/keyword/:id/isActive=:isActive', async (req: Request, res: Response) => {
            let isActive = Number(req.params.isActive);
            let id = Number(req.params.id);
            if (req.params.id.length > 0) {
                let ret = await KeywordDb.setIsActive(id, isActive);

                let blockedIps = await Keywords.getBlockedIPs();
                console.log(". updating IP filters configured on router");
                await Router.updateBlockedIPs(blockedIps);
                console.log("✓ success");
                
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        })

        //update name or expression
        app.put('/api/keyword/:id', async (req: Request, res: Response) => {
            let id = Number(req.params.id);
            if (req.body.name && req.body.expression) {
                let ret = await KeywordDb.update(id, req.body.name, req.body.expression);

                let blockedIps = await Keywords.getBlockedIPs();
                console.log(". updating IP filters configured on router");
                await Router.updateBlockedIPs(blockedIps);
                console.log("✓ success");

                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        })
    }
}