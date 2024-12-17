import express, { Express, Request, Response } from 'express';
import { SettingDb, SettingKey } from './settingDb';

export class SettingApi {
    static init(app: Express) {

        // check pin
        app.post('/api/check-pin', async (req: Request, res: Response) => {
            let pin = await SettingDb.getString(SettingKey.pin);
            let isMatch = pin == req.body.pin.substring(0,4);
            res.status(200).json(isMatch);
        });

        //set value
        app.put('/api/settings/:key', async (req: Request, res: Response) => {
            let key = Number(req.params.key);
            if (key > 0 && req.body.value.length > 0) {
                let ret = await SettingDb.set(key, req.body.value);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        });


        //get all requests
        app.get('/api/settings', async (req: Request, res: Response) => {
            let ret = await SettingDb.getAll();
            res.status(200).json(ret);
        });

        app.get('/api/settings/:key', async (req: Request, res: Response) => {
            let key = Number(req.params.key);
            if (key > 0) {
                let ret = await SettingDb.getObjectByKey(key);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        });

    }
}