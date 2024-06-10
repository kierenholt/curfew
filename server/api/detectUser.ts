import { Express, Request, Response } from 'express';
import { DhcpServer } from '../dhcp/dhcpServer';
import { Device } from '../db/device';
import { User } from '../db/user';
import { Redirector } from '../redirector';
import { hostname } from 'os';
import { UserGroup } from '../db/userGroup';

interface DetectUserResponse {
    user: User | null;
    device: Device | null;
    group: UserGroup | null;
}


export class DetectUser {
    static init(app: Express) {

        //get all users
        app.get('/api/detectUser', async (req: Request, res: Response) => {
            //get ip
            if (req.socket.remoteAddress == null) {
                res.status(400).json({ error: "remote address not found" });
                return;
            }

            let deviceExists = await DhcpServer.hasIP(req.socket.remoteAddress);
            if (!deviceExists) {
                res.status(200).json({ user: null, device: null, group: null });
                return;
            }

            let deviceId = DhcpServer.getDeviceIdFromIP(req.socket.remoteAddress);
            let device: Device | null = await Device.getById(deviceId);
            let user: User | null;
            if (device == null) {
                let deviceName = DhcpServer.getHostNameFromIP(req.socket.remoteAddress);
                if (deviceName.length == 0) {
                    deviceName = deviceId;
                }
                [device, user] = await Redirector.createNewDeviceAndUser(deviceId, deviceName);
            }
            else {
                user = await User.getById(device.ownerId);
                if (user == null) {
                    console.error("detectuser: user get error");
                    res.status(200).json({ user: null, device: null, group: null });
                    return;
                }
            }

            let group = await UserGroup.getById(user.groupId);
            if (group == null) {
                console.error("detectuser: group get error");
                res.status(200).json({ user: null, device: null, group: null });
                return;
            }

            //if no administrators then set as admin
            let administrators = await User.getAllAdministrators();
            if (administrators.length == 0) {
                User.update(user.id, user.groupId, user.name, true);
            }

            let ret: DetectUserResponse = {
                user: user,
                device: device,
                group: group
            }

            res.status(200).json(ret);
        });
    }
}