import express, { Express, Request, Response } from 'express';

export class DnsResponseApi {
    static init(app: Express) {

        // //get all requests
        // app.get('/api/DnsResponses', async (req: Request, res: Response) => {
        //     let ret = await DnsResponse.getAll();
        //     res.status(200).json(ret);
        // });
        // app.get('/api/DnsResponses/:key', async (req: Request, res: Response) => {
        //     let key = Number(req.params.key);
        //     if (key > 0) {
        //         let ret = await DnsResponse.getByKey(key);
        //         res.status(200).json(ret);
        //     }
        //     else {
        //         res.status(400).send("parameter error");
        //     }
        // });
    }
}