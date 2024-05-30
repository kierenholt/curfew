import { Booking } from "./db/booking";
import { Device } from "./db/device";
import { DnsRequest } from "./db/dnsRequest";
import { Filter, FilterAction } from "./db/filter";
import { User } from "./db/user";
import { UserGroup } from "./db/userGroup";
import { DhcpServer } from "./dhcp/dhcpServer";

//copied into app
export enum RedirectReason {
    error = 0,
    curfew = 1,
    domainIsAlwaysAllowed = 10, domainIsAlwaysBlocked = 11,
    filterNotFound = 12,
    needsToBook = 13, hasBooked = 14,
    deviceIsBanned = 21, userIsBanned = 22, groupIsBanned = 23
}

export enum RedirectDestination {
    app = 1, blocked = 0, allow = 2
}

export class Redirector {

    static BLOCK_IF_DOMAIN_NOT_FOUND: boolean = false;
    static LOCAL_APP_DOMAIN = "curfew";

    static async redirectTo(hostAddress: string, fullDomain: string = ""): Promise<RedirectDestination> {
        
        if (hostAddress.length == 0) {
            console.error("hostAddress cannot be null");
            return RedirectDestination.blocked;
        }
        
        //do not save if request is curfew - keep the last status
        //going to app
        if (fullDomain == this.LOCAL_APP_DOMAIN) {
            return RedirectDestination.app;
        }
        
        let obj = await this.getOrCreateDevice(hostAddress);
        
        if (obj.device == null || obj.user == null || obj.group == null) {
            console.error("device / owner / group should not be null");
            return RedirectDestination.blocked;
        }
        
        let device: Device = obj.device;
        let owner: User = obj.user;
        let group: UserGroup = obj.group;
        
        if (device.isBanned) {
            DnsRequest.create(device.id, fullDomain, RedirectReason.deviceIsBanned, RedirectDestination.blocked);
            return RedirectDestination.blocked;
        }
        
        if (owner.isBanned) {
            DnsRequest.create(device.id, fullDomain, RedirectReason.userIsBanned, RedirectDestination.blocked);
            return  RedirectDestination.blocked;
        }
        
        if (group.isBanned) {
            DnsRequest.create(device.id, fullDomain, RedirectReason.groupIsBanned, RedirectDestination.blocked);
            return  RedirectDestination.blocked;
        }
        
        if (group.isUnrestricted) { //member of unrestricted group
            // do not save
            return RedirectDestination.allow;
        }

        let domainFilter: Filter | null = await Filter.getFromDomainNameAndGroup(fullDomain, group.id);

        if (domainFilter == null) { //domain not listed
            if (this.BLOCK_IF_DOMAIN_NOT_FOUND) {
                DnsRequest.create(device.id, fullDomain, RedirectReason.filterNotFound, RedirectDestination.blocked);
                return RedirectDestination.blocked;
            }
            else {
                DnsRequest.create(device.id, fullDomain, RedirectReason.filterNotFound, RedirectDestination.allow);
                return RedirectDestination.allow;
            }
        }
            
        //domain is always allowed
        if (domainFilter.action == FilterAction.alwaysAllow) {
            DnsRequest.create(device.id, fullDomain, RedirectReason.domainIsAlwaysAllowed, RedirectDestination.allow);
            return RedirectDestination.allow;
        }

        //domain is always blocked -> page
        if (domainFilter.action == FilterAction.alwaysDeny) {
            DnsRequest.create(device.id, fullDomain, RedirectReason.domainIsAlwaysBlocked, RedirectDestination.blocked);
            return RedirectDestination.blocked;
        }
        
        let isBooked = await Booking.existsNowForUser(owner.id);

        if (isBooked) {
            DnsRequest.create(device.id, fullDomain, RedirectReason.hasBooked, RedirectDestination.allow);
            return RedirectDestination.allow;
        }

        DnsRequest.create(device.id, fullDomain, RedirectReason.needsToBook, RedirectDestination.blocked);
        return RedirectDestination.blocked;
    }

    static async getOrCreateDevice(IP: string): 
        Promise<{device: Device | null, user: User | null, group: UserGroup | null}> {

        //get MAC
        let deviceId = DhcpServer.getDeviceIdFromIP(IP);
        if (deviceId.length == 0) {
            return { device: null, user: null, group: null }
        }

        //find user
        let device = await Device.getById(deviceId);

        if (device == null) { //device not found -> create the device and user
            let hostname = DhcpServer.getHostNameFromIP(IP);
            if (hostname.length == 0) {
                hostname = deviceId;
            }
            let username = "owner of " + hostname;
            let userId = await User.create(UserGroup.FIRST_GROUP_ID, username);
            let firstGroup = await UserGroup.getById(UserGroup.FIRST_GROUP_ID);
            try {
                await Device.create(deviceId, userId, hostname);
            }
            catch {
                return { device: null, user: null, group: null }
            }
            return {
                device: new Device(deviceId, userId, hostname, 0),
                user: new User(userId, UserGroup.FIRST_GROUP_ID, username, 0),
                group: firstGroup
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