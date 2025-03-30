import { Express, Request, Response } from 'express';
import { Progress } from '../progress/progress';
import { CurfewDb } from '../db';
import { RouterProvider } from '../router/routerProvider';
import { Setting, SettingKey } from '../settings/setting';

export class KeywordApi {
    static init(app: Express, db: CurfewDb) {

        // //get all
        app.get('/api/keywords', async (req: Request, res: Response) => {
            let ret = await db.keywordQuery.getAll();
            res.status(200).json(ret);
        });

        app.get('/api/keyword/:id', async (req: Request, res: Response) => {
            let id = Number(req.params.id);
            if (req.params.id.length > 0) {
                let ret = await db.keywordQuery.getById(id);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        });

        app.get('/api/keyword/:id/blockedIps', async (req: Request, res: Response) => {
            let id = Number(req.params.id);
            if (req.params.id.length > 0) {
                let ret = await db.getBlockedIpsOfKeyword(id);
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
            let ports = req.body.keyword.ports;
            let isActive = Number(req.body.keyword.isActive);
            let nonce = Number(req.body.nonce);
            if (id > 0) {
                let ret = await db.keywordQuery.update(id, name, expression, ports, isActive);

                Progress.update(nonce, false, "...");
                let router = await new RouterProvider(await db.settingQuery.getRouterOptions())
                    .savedRouter(await db.settingQuery.getString(SettingKey.routerModel));
                if (router == null) {
                    res.status(400).send("router not found");
                    return;
                }
                else {
                    db.getAllBlockedIPsAndPorts()
                        .then((ipsAndPorts) =>
                            router?.applyBlockedIPsAndPorts(ipsAndPorts,
                                    (message: string, isSuccess: boolean) => Progress.update(nonce, isSuccess, message),
                                ));
    
                    res.status(200).json(ret);
                }
            }
            else {
                res.status(400).send("parameter error");
            }
        });

        app.delete('/api/keyword/:id', async (req: Request, res: Response) => {
            let id = Number(req.params.id);
            if (id > 0) {
                let ret = await db.keywordQuery.delete(id);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        });

        //create
        app.post('/api/keywords', async (req: Request, res: Response) => {
            if (req.body.name && req.body.expression) { //ports can be empty string
                let success = await db.keywordQuery.create(req.body.name, req.body.expression, req.body.ports, 0) > 0;
                res.status(200).json(success);
            }
            else {
                res.status(400).send("parameter error");
            }
        });

        //block all
        app.put('/api/keywords/block', async (req: Request, res: Response) => {
            let nonce = Number(req.body.nonce);
            let ret = await db.keywordQuery.setAllActive();

            Progress.update(nonce, false, "...");
            let router = await new RouterProvider(await db.settingQuery.getRouterOptions())
                .savedRouter(await db.settingQuery.getString(SettingKey.routerModel));
            if (router == null) {
                res.status(400).send("router not found");
                return;
            }
            else {
                db.getAllBlockedIPsAndPorts()
                    .then((ipsAndPorts) =>
                        router.applyBlockedIPsAndPorts(ipsAndPorts,
                            (message: string, isSuccess: boolean) => Progress.update(nonce, isSuccess, message)));

                res.status(200).json(ret);
            }
        });

        //allow all
        app.put('/api/keywords/allow', async (req: Request, res: Response) => {
            let nonce = Number(req.body.nonce);
            let ret = await db.keywordQuery.setAllInactive();

            Progress.update(nonce, false, "...");
            let router = await new RouterProvider(await db.settingQuery.getRouterOptions())
                .savedRouter(await db.settingQuery.getString(SettingKey.routerModel));
            if (router == null) {
                res.status(400).send("router not found");
                return;
            }
            else {
                db.getAllBlockedIPsAndPorts()
                    .then((ipsAndPorts) =>
                        router.applyBlockedIPsAndPorts(ipsAndPorts,
                            (message: string, isSuccess: boolean) => Progress.update(nonce, isSuccess, message)));
    
                res.status(200).json(ret);
            }
        });
    }
}