import { Express, Request, Response } from 'express';
import { DhcpServer } from '../dhcp/dhcpServer';
import { Device } from '../db/device';
import { DnsRequest } from '../db/dnsRequest';


export class RequestHistory {
    static init(app: Express) {

        //get all users
        app.get('/api/requestHistory', async (req: Request, res: Response) => {
            //get ip
            if (req.socket.remoteAddress == null) {
                res.status(400).send("remote address not found");
                return;
            }
            
            let deviceId = DhcpServer.getDeviceIdFromIP(req.socket.remoteAddress);
            let device = await Device.getById(deviceId);
            if (device == null) {
                res.status(400).send("device not found");
                return;
            }

            let ret = await DnsRequest.getByDeviceId(deviceId);

            res.status(200).json(ret); //DnsRequest[]
        });
    }
}