import { Express, Request, Response } from 'express';
import { User } from '../db/user';
import { Booking } from '../db/booking';
import { Device } from '../db/device';
import { Redirect, RedirectPage } from '../redirect';
import { Domain } from '../db/domain';
import { List } from '../db/list';
import { UserGroup } from '../db/userGroup';

export interface RedirectPayload {
    device: Device | null;
    owner: User | null;
    group: UserGroup | null;
    domain: Domain | null;
    list: List | null;
    bookedSlot: Booking | null;
    redirectResult: RedirectPage;
    createdOn: Date;
}

export class RedirectAPI {
    static init(app: Express) {

        //get all users
        app.get('/api/redirect', async (req: Request, res: Response) => {
            //get ip
            let ip = req.socket.remoteAddress;
            if (ip == null) {
                res.status(400).send("remote address not found");
                return;
            }
            
            let r = Redirect.mostRecentRedirectsByIP[ip];

            if (r == null) {
                res.status(200).json(null);
                return;
            }

            let ret: RedirectPayload = {
                device: r.device,
                owner: r.owner,
                group: r.group,
                domain: r.domain,
                list: r.list,
                bookedSlot: r.bookedSlot,
                redirectResult: r.redirectResult,
                createdOn: r.createdOn,
            }

            res.status(200).json(ret);
        });
    }
}