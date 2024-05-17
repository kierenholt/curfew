import express, { Express, Request, Response } from 'express';
import { Redirector } from '../redirector';
import { Device } from '../db/device';
import { User } from '../db/user';
import { UserGroup } from '../db/userGroup';
import { Domain } from '../db/domain';
import { List } from '../db/list';
import { BookableSlot } from '../db/bookableSlot';
import { BookedSlot } from '../db/bookedSlot';


export class API {
    static init() {
        const app: Express = express();

        app.use(express.json());       // to support JSON-encoded bodies
        //app.use(express.urlencoded()); // to support URL-encoded bodies

        const port = 5000;
        
        app.get('/api/portal', async (req: Request, res: Response) => {
            if (req.socket.remoteAddress == undefined) {
                res.status(500).send();
                return;
            }

            let redirect = Redirector.getRequest(req.socket.remoteAddress);
            if (redirect == null) {
                res.status(500).send(); //dashboard?
                return;
            }

            res.status(200).send(redirect);
        });
        

        //create device
        app.post('/api/devices', async (req: Request, res: Response) => {
            if (req.body.MAC && req.body.name && req.body.ownerId) {
                let ret = await Device.create(req.body.MAC, req.body.ownerId, req.body.name);
                res.status(200).send({id: ret});
            }
            else {
                res.status(400).send("parameter error");
            }
        });


        //create user
        app.post('/api/users', async (req: Request, res: Response) => {
            if (req.body.name && req.body.groupId) {
                let ret = await User.create(req.body.groupId, req.body.name);
                res.status(200).send({id: ret});
            }
            else {
                res.status(400).send("parameter error");
            }
        });


        //create group
        app.post('/api/userGroups', async (req: Request, res: Response) => {
            if (req.body.name && req.body.isUnrestricted) {
                let ret = await UserGroup.create(req.body.name, req.body.isUnrestricted);
                res.status(200).send({id: ret});
            }
            else {
                res.status(400).send("parameter error");
            }
        });


        //create domain
        app.post('/api/domains', async (req: Request, res: Response) => {
            if (req.body.component && req.body.listId) {
                let ret = await Domain.create(req.body.component, req.body.listId);
                res.status(200).send({id: ret});
            }
            else {
                res.status(400).send("parameter error");
            }
        });


        //create list
        app.post('/api/lists', async (req: Request, res: Response) => {
            if (req.body.name && req.body.filterAction) {
                let ret = await List.create(req.body.name, req.body.filterAction);
                res.status(200).send({id: ret});
            }
            else {
                res.status(400).send("parameter error");
            }
        });


        //create bookable slot
        app.post('/api/bookableSlots', async (req: Request, res: Response) => {
            if (req.body.refillsOn && req.body.numSlots && req.body.duration) {
                let ret = await BookableSlot.create(req.body.refillsOn, req.body.numSlots, req.body.duration);
                res.status(200).send({id: ret});
            }
            else {
                res.status(400).send("parameter error");
            }
        });


        //create booked slot
        app.post('/api/bookedSlots', async (req: Request, res: Response) => {
            if (req.body.bookableSlotId && req.body.userId) {
                let ret = await BookedSlot.fromBookableSlot(req.body.bookableSlotId, req.body.userId);
                res.status(200).send({id: ret});
            }
            else {
                res.status(400).send("parameter error");
            }
        });

        //get all devices
        app.get('/api/devices', async (req: Request, res: Response) => {
            let ret = await Device.getAll();
            res.status(200).send(ret);
        });
        //get 1 device
        app.get('/api/device/:mac', async (req: Request, res: Response) => {
            let ret = await Device.getByMac(req.params.mac);
            res.status(200).send(ret);
        });


        //get all users
        app.get('/api/users', async (req: Request, res: Response) => {
            let ret = await User.getAll();
            res.status(200).send(ret);
        });
        //get 1 user
        app.get('/api/users/:id', async (req: Request, res: Response) => {
            let id = Number(req.params.id);
            if (id > 0) {
                let ret = await User.getById(id);
                res.status(200).send(ret);
            }
            res.status(400).send();
        });


        //get all user groups
        app.get('/api/userGroups', async (req: Request, res: Response) => {
            let ret = await UserGroup.getAll();
            res.status(200).send(ret);
        });
        //get 1 user groups
        app.get('/api/userGroups/:id', async (req: Request, res: Response) => {
            let id = Number(req.params.id);
            if (id > 0) {
                let ret = await UserGroup.getById(id);
                res.status(200).send(ret);
            }
            res.status(400).send();
        });


        //get all domains
        app.get('/api/domains', async (req: Request, res: Response) => {
            let ret = await Domain.getAll();
            res.status(200).send(ret);
        });
        //get 1 domain
        app.get('/api/domains/:id', async (req: Request, res: Response) => {
            let id = Number(req.params.id);
            if (id > 0) {
                let ret = await Domain.getById(id);
                res.status(200).send(ret);
            }
            res.status(400).send();
        });


        //get all lists
        app.get('/api/lists', async (req: Request, res: Response) => {
            let ret = await List.getAll();
            res.status(200).send(ret);
        });
        //get 1 list
        app.get('/api/lists/:id', async (req: Request, res: Response) => {
            let id = Number(req.params.id);
            if (id > 0) {
                let ret = await List.getById(id);
                res.status(200).send(ret);
            }
            res.status(400).send();
        });


        //get all bookable slot
        app.get('/api/bookableSlots', async (req: Request, res: Response) => {
            let ret = await BookableSlot.getAll();
            res.status(200).send(ret);
        });
        //get 1 bookable slot
        app.get('/api/bookableSlots/:id', async (req: Request, res: Response) => {
            let id = Number(req.params.id);
            if (id > 0) {
                let ret = await BookableSlot.getById(id);
                res.status(200).send(ret);
            }
            res.status(400).send();
        });


        //get all booked slots
        app.get('/api/bookedSlots', async (req: Request, res: Response) => {
            let ret = await BookedSlot.getAll();
            res.status(200).send(ret);
        });
        //get 1 booked slot
        app.get('/api/bookedSlots/:id', async (req: Request, res: Response) => {
            let id = Number(req.params.id);
            if (id > 0) {
                let ret = await BookedSlot.getById(id);
                res.status(200).send(ret);
            }
            res.status(400).send();
        });


        app.listen(port, () => {
            console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
        });
    }
}
