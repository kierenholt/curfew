import { Express, Request, Response } from 'express';
import { KeywordDb } from './keywordDb';
import { Progress } from '../progress/progress';
import { Keywords } from './keywords';
import { VirginRouter } from '../router/virgin/virginRouter';
import { SettingDb, SettingKey } from '../settings/settingDb';
import { NetworkSetting } from '../settings/networkSetting';

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

        app.get('/api/keyword/:id/blockedIps', async (req: Request, res: Response) => {
            let id = Number(req.params.id);
            if (req.params.id.length > 0) {
                let ret = await Keywords.getBlockedIps(id);
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
                let ret = await KeywordDb.update(id, name, expression, ports, isActive);

                Progress.update(nonce, false, "...");
                let password = await SettingDb.getString(SettingKey.routerAdminPassword);
                let routerIp = await NetworkSetting.getRouterIp();
                let fullNetworkAsHex = await NetworkSetting.getFullNetworkAsHex();

                //no await
                Keywords.getBlockedIPsAndPorts()
                    .then(([ips, ports]) =>
                        new VirginRouter(password, routerIp, fullNetworkAsHex).updateBlockedIPsAndPorts(ips, 
                                ports,
                                (message: string, isSuccess: boolean) => Progress.update(nonce, isSuccess, message),
                            ));

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

        //create
        app.post('/api/keywords', async (req: Request, res: Response) => {
            if (req.body.name && req.body.expression) { //ports can be empty string
                let ret = await KeywordDb.create(req.body.name, req.body.expression, req.body.ports, 0);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        });

        //block all
        app.put('/api/keywords/block', async (req: Request, res: Response) => {
            let nonce = Number(req.body.nonce);
            let ret = await KeywordDb.setAllActive();

            Progress.update(nonce, false, "...");
            let password = await SettingDb.getString(SettingKey.routerAdminPassword);
            let routerIp = await NetworkSetting.getRouterIp();
            let fullNetworkAsHex = await NetworkSetting.getFullNetworkAsHex();

            //no await
            Keywords.getBlockedIPsAndPorts()
                .then(([ips, ports]) =>
                    new VirginRouter(password, routerIp, fullNetworkAsHex).updateBlockedIPsAndPorts(ips, 
                        ports,
                        (message: string, isSuccess: boolean) => Progress.update(nonce, isSuccess, message)));

            res.status(200).json(ret);
        });

        //allow all
        app.put('/api/keywords/allow', async (req: Request, res: Response) => {
            let nonce = Number(req.body.nonce);
            let ret = await KeywordDb.setAllInactive();

            Progress.update(nonce, false, "...");
            let password = await SettingDb.getString(SettingKey.routerAdminPassword);
            let routerIp = await NetworkSetting.getRouterIp();
            let fullNetworkAsHex = await NetworkSetting.getFullNetworkAsHex();

            //no await
            Keywords.getBlockedIPsAndPorts()
                .then(([ips, ports]) =>
                    new VirginRouter(password, routerIp, fullNetworkAsHex).updateBlockedIPsAndPorts(ips, 
                        ports,
                        (message: string, isSuccess: boolean) => Progress.update(nonce, isSuccess, message)));

            res.status(200).json(ret);
        });
    }
}