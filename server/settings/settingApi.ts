import express, { Express, Request, Response } from 'express';

export class SettingApi {
    static init(app: Express) {

        // //get all requests
        // app.get('/api/settings', async (req: Request, res: Response) => {
        //     let ret = await Setting.getAll();
        //     res.status(200).json(ret);
        // });
        // app.get('/api/settings/:key', async (req: Request, res: Response) => {
        //     let key = Number(req.params.key);
        //     if (key > 0) {
        //         let ret = await Setting.getByKey(key);
        //         res.status(200).json(ret);
        //     }
        //     else {
        //         res.status(400).send("parameter error");
        //     }
        // });
    }
}