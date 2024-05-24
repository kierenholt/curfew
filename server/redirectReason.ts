import { Booking } from "./db/booking";
import { Device } from "./db/device";
import { Domain } from "./db/domain";
import { FilterAction, List } from "./db/list";
import { User } from "./db/user";
import { UserGroup } from "./db/userGroup";
import { DhcpServer } from "./dhcp/dhcpServer";

//copied into app
export enum RedirectReason {
    notRedirected = 0,
    domainIsBlocked = 4, domainNotInList = 5,
    needsToBook = 6,
    error = 7,
    curfew = 8,
    deviceIsBanned = 9, userIsBanned = 10, groupIsBanned = 11
}

export class RedirectReasonInfo {
    static BLOCK_IF_DOMAIN_NOT_FOUND: boolean = true;

    device: Device | null = null;
    owner: User | null = null;
    group: UserGroup | null = null;
    domain: Domain | null = null;
    list: List | null = null;
    bookedSlot: Booking | null = null;
    redirectReason: RedirectReason = RedirectReason.error;
    createdOn: Date = new Date();

    static LOCAL_APP_DOMAIN = "curfew";

    static mostRecentRedirectsByIP: {[ip: string]: RedirectReasonInfo } = {};
    
    static async create(hostAddress: string, fullDomain: string = ""): Promise<RedirectReasonInfo> {
        if (hostAddress.length == 0) throw("hostAddress cannot be null");
        
        let ret = new RedirectReasonInfo();
        
        //do not save if request is curfew - keep the last status
        //going to app
        if (fullDomain == this.LOCAL_APP_DOMAIN) {
            ret.redirectReason = RedirectReason.curfew;
            return ret;
        }

        //save if not going to app
        this.mostRecentRedirectsByIP[hostAddress] = ret;
        
        let obj = await this.getOrCreateDevice(hostAddress);
        ret.device = obj.device; ret.owner = obj.user; ret.group = obj.group;

        if (ret.device == null || ret.owner == null || ret.group == null) {
            ret.redirectReason = RedirectReason.error;
            return ret;
        }

        if (ret.device.isBanned) {
            ret.redirectReason = RedirectReason.deviceIsBanned;
            return ret;    
        }

        if (ret.owner.isBanned) {
            ret.redirectReason = RedirectReason.userIsBanned;
            return ret;    
        }

        if (ret.group.isBanned) {
            ret.redirectReason = RedirectReason.groupIsBanned;
            return ret;    
        }

        if (ret.group.isUnrestricted) { //member of unrestricted group
            ret.redirectReason = RedirectReason.notRedirected;
            return ret;
        }
        
        ret.domain = await Domain.getFromDomainName(fullDomain);

        if (ret.domain == null) { //domain not found -> page
            ret.redirectReason = this.BLOCK_IF_DOMAIN_NOT_FOUND ? 
                RedirectReason.domainIsBlocked :
                RedirectReason.notRedirected;
                return ret;
        }
        //list id found
        ret.list = await ret.domain.list;
        if (ret.list == null) { //list not found -> page
            ret.redirectReason = RedirectReason.domainNotInList;
            return ret;
        }
        //domain is always allowed
        if (ret.list.filterAction == FilterAction.alwaysAllow) {
            ret.redirectReason = RedirectReason.notRedirected;
            return ret;
        }   
        //domain is always blocked -> page
        else if (ret.list.filterAction == FilterAction.alwaysBlock) {
            ret.redirectReason = RedirectReason.domainIsBlocked;
            return ret;
        }
        else { //needs slot
            //has the user booked a slot?
            ret.bookedSlot = null;//await Booking.bookedSlotInUse(ret.owner.id);
            if (ret.bookedSlot) {
                ret.redirectReason = RedirectReason.notRedirected;
                return ret;
            }
            else { //slot not booked or no slots available -> book a slot page
                ret.redirectReason = RedirectReason.needsToBook;
                return ret;
            }
        }
    }

    static async getOrCreateDevice(IP: string): Promise<{device: Device | null, user: User | null, group: UserGroup | null}> {

        //get MAC
        let deviceId = DhcpServer.getDeviceIdFromIP(IP);

        //find user
        let device = await Device.getById(deviceId);

        if (device == null) { //device not found -> create the device and user
            let hostname = DhcpServer.getHostNameFromIP(IP);
            if (hostname.length == 0) {
                hostname = deviceId;
            }
            let username = "owner of " + hostname;
            let userId = await User.create(UserGroup.FIRST_GROUP_ID, hostname);
            let unknownGroup = await UserGroup.getById(UserGroup.FIRST_GROUP_ID);
            await Device.create(deviceId, userId, hostname);
            return {
                device: new Device(deviceId, userId, hostname, 0),
                user: new User(userId, unknownGroup.id, username, 0),
                group: unknownGroup
            }
        }
        else { //device found - get user
            let user = await User.getById(device.ownerId);
            let group = null;
            if (user != null) {
                group = await UserGroup.getById(user.groupId)
            }
            return {
                device: device,
                user: user,
                group: group,
            }
        }
    }
}