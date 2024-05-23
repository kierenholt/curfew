import { Booking } from "./db/booking";
import { Device } from "./db/device";
import { Domain } from "./db/domain";
import { FilterAction, List } from "./db/list";
import { User } from "./db/user";
import { UserGroup } from "./db/userGroup";
import { DhcpServer } from "./dhcp/dhcpServer";

export enum RedirectPage {
    notRedirected = 0, 
    nameTheDevicePage = 1, nameTheOwnerPage = 2,
    nameTheGroupPage = 3, domainIsBlockedPage = 4, domainNotInListPage = 5,
    bookASlotPage = 6, 
    errorPage = 7, 
    homePage = 8,
    deviceIsBanned = 9, userIsBanned = 10, groupIsBanned = 11
}

export class Redirect {
    static BLOCK_IF_DOMAIN_NOT_FOUND: boolean = true;
    static LOCAL_APP_DOMAIN = "curfew";

    device: Device | null = null;
    owner: User | null = null;
    group: UserGroup | null = null;
    domain: Domain | null = null;
    list: List | null = null;
    bookedSlot: Booking | null = null;
    redirectResult: RedirectPage = RedirectPage.errorPage;
    createdOn: Date = new Date();

    static mostRecentRedirectsByIP: {[ip: string]: Redirect } = {};
    
    static async create(hostAddress: string, fullDomain: string = ""): Promise<Redirect> {
        if (hostAddress.length == 0) throw("hostAddress cannot be null");
        
        let ret = new Redirect();
        this.mostRecentRedirectsByIP[hostAddress] = ret;
        
        let obj = await this.getOrCreateDevice(hostAddress);
        ret.device = obj.device; ret.owner = obj.user; ret.group = obj.group;

        if (ret.device == null || ret.owner == null || ret.group == null) {
            ret.redirectResult = RedirectPage.errorPage;
            return ret;
        }

        if (fullDomain == this.LOCAL_APP_DOMAIN) {
            ret.redirectResult = RedirectPage.homePage;
            return ret;
        }

        if (ret.device.isBanned) {
            ret.redirectResult = RedirectPage.deviceIsBanned;
            return ret;    
        }

        if (ret.owner.isBanned) {
            ret.redirectResult = RedirectPage.userIsBanned;
            return ret;    
        }

        if (ret.group.isBanned) {
            ret.redirectResult = RedirectPage.groupIsBanned;
            return ret;    
        }

        if (ret.group.isUnrestricted) { //member of unrestricted group
            ret.redirectResult = RedirectPage.notRedirected;
            return ret;
        }
        
        ret.domain = await Domain.getFromDomainName(fullDomain);

        if (ret.domain == null) { //domain not found -> page
            ret.redirectResult = this.BLOCK_IF_DOMAIN_NOT_FOUND ? 
                RedirectPage.domainIsBlockedPage :
                RedirectPage.notRedirected;
                return ret;
        }
        //list id found
        ret.list = await ret.domain.list;
        if (ret.list == null) { //list not found -> page
            ret.redirectResult = RedirectPage.domainNotInListPage;
            return ret;
        }
        //domain is always allowed
        if (ret.list.filterAction == FilterAction.alwaysAllow) {
            ret.redirectResult = RedirectPage.notRedirected;
            return ret;
        }   
        //domain is always blocked -> page
        else if (ret.list.filterAction == FilterAction.alwaysBlock) {
            ret.redirectResult = RedirectPage.domainIsBlockedPage;
            return ret;
        }
        else { //needs slot
            //has the user booked a slot?
            ret.bookedSlot = null;//await Booking.bookedSlotInUse(ret.owner.id);
            if (ret.bookedSlot) {
                ret.redirectResult = RedirectPage.notRedirected;
                return ret;
            }
            else { //slot not booked or no slots available -> book a slot page
                ret.redirectResult = RedirectPage.bookASlotPage;
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