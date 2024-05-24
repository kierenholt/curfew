import express, { Express, Request, Response } from 'express';
import { Redirector } from '../redirector';
import { Device } from '../db/device';
import { User } from '../db/user';
import { UserGroup } from '../db/userGroup';
import { Domain } from '../db/domain';
import { List } from '../db/list';
import { Quota } from '../db/quota';
import { Booking } from '../db/booking';
import { MakeABooking } from './makeABooking';
import { RedirectAPI } from './getRedirect';

export class API {
    static init() {
        const app: Express = express();

        app.use(express.json());       // to support JSON-encoded bodies
        //app.use(express.urlencoded()); // to support URL-encoded bodies

        const port = 5000;

        app.get('/api/portal', async (req: Request, res: Response) => {
            if (req.socket.remoteAddress == undefined) {
                res.status(500).json({});
                return;
            }

            let redirect = Redirector.getRequestReason(req.socket.remoteAddress);
            if (redirect == null) {
                res.status(500).json({}); //dashboard?
                return;
            }

            res.status(200).send(redirect);
        });
        

        //https://developer.accela.com/docs/construct-apiNamingConventions.html
        //create device
        app.post('/api/devices', async (req: Request, res: Response) => {
            if (req.body.id.length == 12 && req.body.name.length > 0 && req.body.ownerId > 0) {
                let ret = await Device.create(req.body.id, req.body.ownerId, req.body.name);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        });
        app.put('/api/devices/:id', async (req: Request, res: Response) => {
            if (req.body.name && req.body.ownerId) {
                let ret = await Device.update(req.params.id, req.body.ownerId, req.body.name);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        });
        app.delete('/api/devices/:id', async (req: Request, res: Response) => {
            let ret = await Device.delete(req.params.id);
            res.status(200).json(ret);
        });
        app.put('/api/devices/:id/isBanned=:isBanned', async (req: Request, res: Response) => {
            let isBanned = Number(req.params.isBanned);
            if (req.params.id.length > 0) {
                let ret = await Device.setBan(req.params.id, isBanned);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        })


        //create user
        app.post('/api/users', async (req: Request, res: Response) => {
            if (req.body.name && req.body.groupId) {
                let ret = await User.create(req.body.groupId, req.body.name);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        });
        app.put('/api/users/:id', async (req: Request, res: Response) => {
            let id = Number(req.params.id);
            if (id > 0 && req.body.name && req.body.groupId) {
                let ret = await User.update(id, req.body.groupId, req.body.name);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        });
        app.delete('/api/users/:id', async (req: Request, res: Response) => {
            let id = Number(req.params.id);
            let ret = await User.delete(id);
            res.status(200).json(ret);
        });
        app.put('/api/users/:userId/isBanned=:isBanned', async (req: Request, res: Response) => {
            let id = Number(req.params.userId);
            let isBanned = Number(req.params.isBanned);
            if (id > 0) {
                let ret = await User.setBan(id, isBanned);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        })


        //create group
        app.post('/api/userGroups', async (req: Request, res: Response) => {
            if (req.body.name && req.body.isUnrestricted !== undefined) {
                let ret = await UserGroup.create(req.body.name, req.body.isUnrestricted);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        });
        app.put('/api/userGroups/:id', async (req: Request, res: Response) => {
            let id = Number(req.params.id);
            if (id > 0 && req.body.name && req.body.isUnrestricted) {
                let ret = await UserGroup.update(id, req.body.name, req.body.isUnrestricted);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        });
        app.delete('/api/userGroups/:id', async (req: Request, res: Response) => {
            let id = Number(req.params.id);
            let ret = await UserGroup.delete(id);
            res.status(200).json(ret);
        });
        app.put('/api/userGroups/:groupId/isBanned=:isBanned', async (req: Request, res: Response) => {
            let id = Number(req.params.groupId);
            let isBanned = Number(req.params.isBanned);
            if (id > 0) {
                let ret = await UserGroup.setBan(id, isBanned);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        })


        //create domain
        app.post('/api/domains', async (req: Request, res: Response) => {
            if (req.body.component && req.body.listId) {
                let ret = await Domain.create(req.body.component, req.body.listId);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        });
        app.put('/api/domains/:id', async (req: Request, res: Response) => {
            let id = Number(req.params.id);
            if (id > 0 && req.body.component && req.body.listId) {
                let ret = await Domain.update(id, req.body.component, req.body.listId);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        });
        app.delete('/api/domains/:id', async (req: Request, res: Response) => {
            let id = Number(req.params.id);
            let ret = await Domain.delete(id);
            res.status(200).json(ret);
        });


        //create list
        app.post('/api/lists', async (req: Request, res: Response) => {
            if (req.body.name && req.body.filterAction) {
                let ret = await List.create(req.body.name, req.body.filterAction);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        });
        app.put('/api/lists/:id', async (req: Request, res: Response) => {
            let id = Number(req.params.id);
            if (id > 0 && req.body.name && req.body.filterAction) {
                let ret = await List.update(id, req.body.name, req.body.filterAction);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        });
        app.delete('/api/lists/:id', async (req: Request, res: Response) => {
            let id = Number(req.params.id);
            let ret = await List.delete(id);
            res.status(200).json(ret);
        });

        //quota
        //no create
        app.put('/api/quotas/:groupId-:day', async (req: Request, res: Response) => {
            let groupId = Number(req.params.groupId);
            let day = Number(req.params.day);
            if (req.body) {
                let ret = await Quota.update(groupId, day, 
                    req.body.refreshAmount, req.body.rollsOver,
                    req.body.maxDuration, req.body.cooldown);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        });

        
        //create bookings
        app.post('/api/bookings', async (req: Request, res: Response) => {
            if (req.body) {
                let ret = await Booking.create(new Date(), req.body.userId, req.body.duration);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        });
        app.put('/api/bookings/:id', async (req: Request, res: Response) => {
            let id = Number(req.params.id);
            if (id > 0 && req.body) {
                let ret = await Booking.update(id, req.body.startsOn, req.body.userId, req.body.groupId, req.body.day, req.body.duration, req.body.cooldown);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        });
        app.delete('/api/bookings/:id', async (req: Request, res: Response) => {
            let id = Number(req.params.id);
            let ret = await Booking.delete(id);
            res.status(200).json(ret);
        });


        //get all devices
        app.get('/api/devices', async (req: Request, res: Response) => {
            let ret = await Device.getAll();
            res.status(200).json(ret);
        });
        //get 1 device
        app.get('/api/devices/:id', async (req: Request, res: Response) => {
            let ret = await Device.getById(req.params.id);
            res.status(200).json(ret);
        });


        //get all users
        app.get('/api/users', async (req: Request, res: Response) => {
            let ret = await User.getAll();
            res.status(200).json(ret);
        });
        //get 1 user
        app.get('/api/users/:id', async (req: Request, res: Response) => {
            let id = Number(req.params.id);
            if (id > 0) {
                let ret = await User.getById(id);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        });


        //get all user groups
        app.get('/api/userGroups', async (req: Request, res: Response) => {
            let ret = await UserGroup.getAll();
            res.status(200).json(ret);
        });
        //get 1 user groups
        app.get('/api/userGroups/:id', async (req: Request, res: Response) => {
            let id = Number(req.params.id);
            if (id > 0) {
                let ret = await UserGroup.getById(id);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        });


        //get all domains
        app.get('/api/domains', async (req: Request, res: Response) => {
            let ret = await Domain.getAll();
            res.status(200).json(ret);
        });
        //get 1 domain
        app.get('/api/domains/:id', async (req: Request, res: Response) => {
            let id = Number(req.params.id);
            if (id > 0) {
                let ret = await Domain.getById(id);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send();
            }
        });


        //get all lists
        app.get('/api/lists', async (req: Request, res: Response) => {
            let ret = await List.getAll();
            res.status(200).json(ret);
        });
        //get 1 list
        app.get('/api/lists/:id', async (req: Request, res: Response) => {
            let id = Number(req.params.id);
            if (id > 0) {
                let ret = await List.getById(id);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send();
            }
        });


        //get all quotas
        app.get('/api/quotas', async (req: Request, res: Response) => {
            let ret = await Quota.getAll();
            res.status(200).json(ret);
        });
        //get quota from group-day
        app.get('/api/quotas/:groupId&:day', async (req: Request, res: Response) => {
            let groupId = Number(req.params.groupId);
            let day = Number(req.params.day);
            if (groupId > 0 && day > 0) {
                let ret = await Quota.getByGroupIdDay(groupId, day);
                res.status(200).json(ret);
            }
        });
        //get quotas from group
        app.get('/api/quotas/:groupId', async (req: Request, res: Response) => {
            let groupId = Number(req.params.groupId);
            if (groupId > 0) {
                let ret = await Quota.getByGroupId(groupId);
                res.status(200).json(ret);
            }
        });


        //get all booked slots
        app.get('/api/bookings', async (req: Request, res: Response) => {
            let ret = await Booking.getAll();
            res.status(200).json(ret);
        });
        //get booked slots from user
        app.get('/api/bookings/userId/:userId', async (req: Request, res: Response) => {
            let userId = Number(req.params.userId);
            if (userId > 0) {
                let ret = await Booking.getByUserId(userId);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        });
        //get 1 booked slot
        app.get('/api/bookings/:id', async (req: Request, res: Response) => {
            let id = Number(req.params.id);
            if (id > 0) {
                let ret = await Booking.getById(id);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        });

        MakeABooking.init(app);
        RedirectAPI.init(app);

        app.listen(port, () => {
            console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
        });
    }
}
