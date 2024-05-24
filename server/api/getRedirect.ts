import { Express, Request, Response } from 'express';
import { User } from '../db/user';
import { Booking } from '../db/booking';
import { Device } from '../db/device';
import { RedirectReasonInfo, RedirectReason } from '../redirectReason';
import { Domain } from '../db/domain';
import { List } from '../db/list';
import { UserGroup } from '../db/userGroup';

// to be copied in the app
export interface RedirectPayload {
    device: Device | null;
    owner: User | null;
    group: UserGroup | null;
    domain: Domain | null;
    list: List | null;
    bookedSlot: Booking | null;
    redirectResult: RedirectReason;
    createdOn: Date;
}

export class RedirectAPI {
    static init(app: Express) {

        //get redirect info
        app.get('/api/redirect', async (req: Request, res: Response) => {
            //get ip
            let ip = req.socket.remoteAddress;
            if (ip == null) {
                res.status(400).send("remote address not found");
                return;
            }
            
            let r = RedirectReasonInfo.mostRecentRedirectsByIP[ip];

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
                redirectResult: r.redirectReason,
                createdOn: r.createdOn,
            }

            res.status(200).json(ret);
        });
    }
}