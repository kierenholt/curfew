import { Express, Request, Response } from 'express';
import { NetPlan } from '../net/netplan';
import { IscDhcp } from '../net/dhcp';
import { CurfewDb } from '../db';
import { SettingKey } from './setting';

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
                    let networkId = await db.settingQuery.getString(SettingKey.networkId);
                    let thisHost = await db.settingQuery.getString(SettingKey.thisHost);
                    let upstreamDns = await db.settingQuery.getString(SettingKey.upstreamDnsServer);
                    let dhcpMaxHost = await db.settingQuery.getString(SettingKey.dhcpMaxHost);
                    let dhcpMinHost = await db.settingQuery.getString(SettingKey.dhcpMinHost);
                    await NetPlan.disableDhcpsetStaticIp(networkId, thisHost, upstreamDns);
                    await IscDhcp.updateSettingsAndRestart(dhcpMinHost, dhcpMaxHost, networkId, thisHost);
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

    }
}