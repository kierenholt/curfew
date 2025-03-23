import { Express, Request, Response } from 'express';
import { NetPlan } from '../net/netplan';
import { IscDhcp } from '../net/dhcp';
import { CurfewDb } from '../db';
import { SettingKey } from './setting';
import { hardReset, shutdown } from '../reset';

export class SettingApi {
    static init(app: Express, db: CurfewDb) {

        // check pin
        app.post('/api/check-pin', async (req: Request, res: Response) => {
            let pin = await db.settingQuery.getString(SettingKey.pin);
            let isMatch = pin == req.body.pin.substring(0, 4);
            res.status(200).json(isMatch);
        });

        //set value
        app.put('/api/settings/:key', async (req: Request, res: Response) => {
            let key = Number(req.params.key);
            if (key > 0 && req.body.value.length > 0) {
                let ret = await db.settingQuery.set(key, req.body.value);

                //change to ip => restart net
                if (key == SettingKey.thisHost) {
                    let dhcpOptions = await db.settingQuery.getDhcpOptions();
                    let netplanOptions = await db.settingQuery.getNetplanOptions();
                    await NetPlan.setStaticIp(netplanOptions);
                    await IscDhcp.updateSettings(dhcpOptions);
                }

                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        });


        //get all requests
        app.get('/api/settings', async (req: Request, res: Response) => {
            let ret = await db.settingQuery.getAll();
            res.status(200).json(ret);
        });

        app.get('/api/settings/:key', async (req: Request, res: Response) => {
            let key = Number(req.params.key);
            if (key > 0) {
                let ret = await db.settingQuery.getObjectByKey(key);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        });

        //disable services, delete network settings and restart
        //curl -i -X DELETE -H "Content-Type: application/json"  http://localhost:5000/api/settings/hardReset
        app.delete('/api/settings/hardReset', async (req: Request, res: Response) => {
            hardReset(db);
        });

        //disable services and shutdown
        //curl -i -X DELETE -H "Content-Type: application/json"  http://localhost:5000/api/settings/shutdown
        app.delete('/api/settings/shutdown', async (req: Request, res: Response) => {
            shutdown(db);
        });
    }
}