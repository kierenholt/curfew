import { Express, Request, Response } from 'express';
import { DhcpServer } from '../dhcp/dhcpServer';
import { Device } from '../db/device';
import { User } from '../db/user';
import { Redirector } from '../redirector';

interface DetectUserResponse {
    user: User | null;
    device: Device | null;
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
                res.status(400).json({ error: "device not DHCP enabled" });
                return;
            }

            let deviceId = DhcpServer.getDeviceIdFromIP(req.socket.remoteAddress);
            let device: Device | null = await Device.getById(deviceId);
            let user: User | null;
            if (device == null) {
                let deviceName = DhcpServer.getHostNameFromIP(req.socket.remoteAddress);
                [device, user] = await Redirector.createNewDeviceAndUser(deviceId, deviceName);
            }
            else {
                user = await User.getById(device.ownerId);
                if (user == null) {
                    throw ("user get error");
                }
            }

            //if no administrators then set as admin
            let administrators = await User.getAllAdministrators();
            if (administrators.length == 0) {
                User.update(user.id, user.groupId, user.name, true);
            }

            let ret: DetectUserResponse = {
                user: user,
                device: device
            }

            res.status(200).json(ret);
        });
    }
}