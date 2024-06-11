import express, { Express, Request, Response } from 'express';
import { Device } from '../db/device';
import { User } from '../db/user';
import { UserGroup } from '../db/userGroup';
import { Filter } from '../db/filter';
import { Quota } from '../db/quota';
import { Booking } from '../db/booking';
import { MakeABooking } from './makeABooking';
import { DnsRequest } from '../db/dnsRequest';
import { DetectUser } from './detectUser';
import { Setting, SettingKey } from '../db/setting';
import { LiveUpdate } from './liveUpdate';
import { Spoof } from '../spoof';
var cors = require('cors')
const nocache = require("nocache");


export class API {
    static init() {
        const app: Express = express();
        
        app.use(nocache());
        app.use(express.json());       // to support JSON-encoded bodies
        //app.use(cors); //breaks everything do not use
        //app.use(express.urlencoded()); // to support URL-encoded bodies
        app.use(express.static(process.env.APP_PATH as string));

        const port: number = Number(process.env.API_PORT);
        const INADDR_ANY = "0.0.0.0"; //https://nodejs.org/dist/latest-v4.x/docs/api/http.html#http_server_listen_port_hostname_backlog_callback

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
        app.put('/api/devices/:id/isBanned=:isBanned', async (req: Request, res: Response) => {
            let isBanned = Number(req.params.isBanned);
            if (req.params.id.length > 0) {
                let ret = await Device.setBan(req.params.id, isBanned);
                if (isBanned) {
                    Spoof.begin(0, [req.params.id]); // 1 minute
                }
                if (!isBanned) {
                    Spoof.cancel([req.params.id]);
                }
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        })
        app.put('/api/devices/:id/isDeleted=:isDeleted', async (req: Request, res: Response) => {
            let isDeleted = Number(req.params.isDeleted);
            if (req.params.id.length > 0) {
                let ret = await Device.setDeleted(req.params.id, isDeleted);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        })


        app.put('/api/users/:id', async (req: Request, res: Response) => {
            let id = Number(req.params.id);
            if (id > 0 && req.body.name && req.body.groupId) {
                let ret = await User.update(id, req.body.groupId, req.body.name, req.body.isAdministrator);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        });
        app.put('/api/users/:id/isDeleted=:isDeleted', async (req: Request, res: Response) => {
            let isDeleted = Number(req.params.isDeleted);
            let id = Number(req.params.id);
            if (id > 0) {
                let ret = await User.setDeleted(id, isDeleted);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
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
        app.put('/api/userGroups/:id/isDeleted=:isDeleted', async (req: Request, res: Response) => {
            let isDeleted = Number(req.params.isDeleted);
            let id = Number(req.params.id);
            if (id > 0) {
                let ret = await UserGroup.setDeleted(id, isDeleted);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
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


        //create filter
        app.post('/api/filters', async (req: Request, res: Response) => {
            if (req.body.component && req.body.groupId) {
                let ret = await Filter.create(req.body.component, req.body.groupId, req.body.action);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        });
        app.put('/api/filters/:id', async (req: Request, res: Response) => {
            let id = Number(req.params.id);
            let groupId = Number(req.body.groupId);
            if (id > 0 && req.body.component && groupId > 0) {
                let ret = await Filter.update(id, req.body.component, groupId, req.body.action);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        });
        app.delete('/api/filters/:id', async (req: Request, res: Response) => {
            let id = Number(req.params.id);
            let ret = await Filter.delete(id);
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
                let ret = await Booking.create(new Date().valueOf(), req.body.userId, req.body.duration);
                //set timer for arp spoof
                let booking = await Booking.getById(ret);
                if (booking) {
                    let devices = await Device.getByOwnerId(req.body.userId);
                    let delay = booking.duration * 60000;
                    Spoof.begin(delay, devices.map(d => d.id));
                }
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

        //no create requests
        //no update
        app.delete('/api/requests/:id', async (req: Request, res: Response) => {
            let id = Number(req.params.id);
            let ret = await DnsRequest.delete(id);
            res.status(200).json(ret);
        });

        //set value
        app.put('/api/settings/:key', async (req: Request, res: Response) => {
            let key = Number(req.params.key);
            if (key > 0 && req.body.value.length > 0) {
                let ret = await Setting.save(key, req.body.value);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        });

        //get all devices includes lastRequestedOn
        app.get('/api/devices', async (req: Request, res: Response) => {
            let devices = await Device.getAll();
            let promises = devices.map(d => DnsRequest.getMostRecentRequest(d.id));
            let requests = await Promise.all(promises);
            let ret: any = [];
            for (let i = 0; i < devices.length; i++) {
                ret[i] = devices[i];
                ret[i].lastRequestedOn = (requests[i] == null ? null : requests[i]?.requestedOn);
            }
            res.status(200).json(ret);
        });
        //get 1 device
        app.get('/api/devices/:id', async (req: Request, res: Response) => {
            let ret = await Device.getById(req.params.id);
            res.status(200).json(ret);
        });
        //get devices of user
        app.get('/api/devices/owner/:ownerId', async (req: Request, res: Response) => {
            let ownerId = Number(req.params.ownerId);
            if (ownerId > 0) {
                let ret = await Device.getByOwnerId(ownerId);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        });


        //get all users, includes hasDevices
        app.get('/api/users', async (req: Request, res: Response) => {
            let users = await User.getAll();
            let promises = users.map(u => Device.getByOwnerId(u.id));
            let devices = await Promise.all(promises);
            let ret: any = [];
            for (let i = 0; i < users.length; i++) {
                ret[i] = users[i];
                ret[i].hasDevices = devices[i].length > 0;
            }
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


        //get all user groups and users and devices
        app.get('/api/tree/userGroups', async (req: Request, res: Response) => {
            let includeDeleted = await Setting.getBool(SettingKey.viewDeleted);
            let groups = await UserGroup.getAll(includeDeleted);
            let users = await User.getAll(includeDeleted);
            let devices = await Device.getAll(includeDeleted);
            for (let u of users) {
                u.devices = devices.filter(d => d.ownerId == u.id);
            }
            for (let g of groups) {
                g.users = users.filter(u => u.groupId == g.id);
            }
            res.status(200).json(groups);
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


        //get all filters
        app.get('/api/filters', async (req: Request, res: Response) => {
            let ret = await Filter.getAll();
            res.status(200).json(ret);
        });
        //get 1 domain
        app.get('/api/filters/:id', async (req: Request, res: Response) => {
            let id = Number(req.params.id);
            if (id > 0) {
                let ret = await Filter.getById(id);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send();
            }
        });
        //get by component and group
        app.get('/api/filters/component/:component/group/:groupId', async (req: Request, res: Response) => {
            let id = Number(req.params.groupId);
            if (id > 0) {
                let ret = await Filter.getFromComponentAndGroup(req.params.component, id);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send();
            }
        });
        //get filters of group
        app.get('/api/filters/userGroup/:groupId', async (req: Request, res: Response) => {
            let id = Number(req.params.groupId);
            if (id > 0) {
                let ret = await Filter.getByGroupId(id);
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
            if (groupId > 0 && day >= 0) {
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
            let bookings = await Booking.getAll();
            let users = await User.getAll();
            let ret = [];
            for (let booking of bookings) {
                ret.push({
                    id: booking.id,
                    startsOn: booking.startsOn,
                    userId: booking.userId,
                    groupId: booking.groupId,
                    day: booking.day,
                    endsOn: booking.endsOn,
                    cooldown: booking.cooldown,
                    duration: booking.duration,
                    user: users.find(u => u.id == booking.userId)
                })
            }
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


        //get all requests
        app.get('/api/requests', async (req: Request, res: Response) => {
            let ret = await DnsRequest.getAll();
            res.status(200).json(ret);
        });
        //of device with offset 
        app.get('/api/requests/device/:deviceId', async (req: Request, res: Response) => {
            let deviceId = req.params.deviceId;
            if (deviceId) {
                let ret = await DnsRequest.getByDeviceId(
                    req.params.deviceId,
                    await Setting.getNumber(SettingKey.apiGetRequestLimit),
                    Number(req.query.offset));
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        });



        //get all requests
        app.get('/api/settings', async (req: Request, res: Response) => {
            let ret = await Setting.getAll();
            res.status(200).json(ret);
        });
        app.get('/api/settings/:key', async (req: Request, res: Response) => {
            let key = Number(req.params.key);
            if (key > 0) {
                let ret = await Setting.getByKey(key);
                res.status(200).json(ret);
            }
            else {
                res.status(400).send("parameter error");
            }
        });

        MakeABooking.init(app);
        DetectUser.init(app);
        LiveUpdate.init(app);

        //https://medium.com/@amasaabubakar/how-you-can-serve-react-js-build-folder-from-an-express-end-point-127e236e4d67
        app.get("*", (req, res) => {
            res.sendFile(process.env.APP_PATH as string & "/index.html");
        })

        app.listen(port, INADDR_ANY, () => {
            console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
        });
    }
}
