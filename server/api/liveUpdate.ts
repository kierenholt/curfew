import { Express, Request, Response } from 'express';
import { DnsRequest } from '../db/dnsRequest';

export class LiveUpdate {

    static resolvesByDeviceId: any = {};

    static init(app: Express) {
        app.get('/api/live/requests/device/:deviceId', async (req: Request, res: Response) => {
            let deviceId = req.params.deviceId;
            if (deviceId) {
                this.waitForNextRequest(deviceId)
                    .then((request: DnsRequest) => {
                        res.status(200).json(request);
                    })
            }
            else {
                res.status(400).send("parameter error");
            }
            //only respond when new request comes in
        })
    }

    static update(deviceId: string, request: DnsRequest) {
        let foundPromiseResolve = this.resolvesByDeviceId[deviceId];
        if (foundPromiseResolve) {
            delete(this.resolvesByDeviceId[deviceId]);
            foundPromiseResolve(request);
        }
    }

    static waitForNextRequest(deviceId: string): Promise<DnsRequest> {
        return new Promise((resolve, reject) => {
            this.resolvesByDeviceId[deviceId] = (request: DnsRequest) => resolve(request);
        })
    }
}