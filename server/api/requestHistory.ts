import { Express, Request, Response } from 'express';
import { DnsRequest } from '../db/dnsRequest';


export class RequestHistory {
    static init(app: Express) {

        //request history
        app.get('/api/device/:deviceId/requestHistory', async (req: Request, res: Response) => {
            
            let ret = await DnsRequest.getByDeviceId(req.params.deviceId);

            res.status(200).json(ret); //DnsRequest[]
        });
    }
}