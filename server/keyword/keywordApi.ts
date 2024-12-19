import { Express, Request, Response } from 'express';
import { KeywordDb } from './keywordDb';
import { Helpers } from '../helpers';
import { Progress } from '../progress/progress';
import { Router } from '../router/router';
import { Keywords } from './keywords';
import { VirginSession } from '../router/virgin';

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

        app.put('/api/keyword/:id', async (req: Request, res: Response) => {
            let id = Number(req.params.id);
            let name = req.body.keyword.name;
            let expression = req.body.keyword.expression;
            let isActive = Number(req.body.keyword.isActive);
            let nonce = Number(req.body.nonce);
            if (id > 0) {
                let ret = await KeywordDb.update(id, name, expression, isActive);

                Progress.update(nonce, false, "...");

                //no await
                Keywords.getBlockedIPs()
                    .then(ips =>
                        Router.updateBlockedIPs(ips,
                            (message: string, isSuccess: boolean) => Progress.update(nonce, isSuccess, message),
                            new VirginSession()));

                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        });

        app.delete('/api/keyword/:id', async (req: Request, res: Response) => {
            let id = Number(req.params.id);
            if (id > 0) {
                let ret = await KeywordDb.delete(id);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        });
    }
}