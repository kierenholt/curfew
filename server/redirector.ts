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
    static BLOCK_IF_DEVICE_NOT_DHCP: boolean = true;
    static LOCAL_APP_DOMAIN = "curfew";

    static async redirectTo(hostAddress: string, fullDomain: string = ""): Promise<RedirectDestination> {

        if (hostAddress.length == 0) {
            console.error("hostAddress should not be null");
            return RedirectDestination.blocked;
        }

        //do not save if request is curfew - keep the last status
        //going to app
        if (fullDomain == this.LOCAL_APP_DOMAIN) {
            return RedirectDestination.app;
        }

        if (!DhcpServer.hasIP(hostAddress)) {
            //console.error("device / owner / group should not be null");
            return this.BLOCK_IF_DEVICE_NOT_DHCP ? RedirectDestination.blocked : RedirectDestination.allow;
        }

        let deviceId = DhcpServer.getDeviceIdFromIP(hostAddress);
        let device: Device | null = await Device.getById(deviceId);
        let owner: User | null;
        if (device == null) {
            let deviceName = DhcpServer.getHostNameFromIP(hostAddress);
            if (deviceName.length == 0) {
                deviceName = deviceId;
            }
            [device, owner] = await Redirector.createNewDeviceAndUser(deviceId, deviceName);
        }
        else {
            owner = await User.getById(device.ownerId);
            if (owner == null) {
                throw("user get error");
            }
        }
        let group = await UserGroup.getById(owner.groupId);
        
        if (device.isBanned) {
            DnsRequest.create(device.id, fullDomain, RedirectReason.deviceIsBanned, RedirectDestination.blocked);
            return RedirectDestination.blocked;
        }

        if (owner.isBanned) {
            DnsRequest.create(device.id, fullDomain, RedirectReason.userIsBanned, RedirectDestination.blocked);
            return RedirectDestination.blocked;
        }

        if (group.isBanned) {
            DnsRequest.create(device.id, fullDomain, RedirectReason.groupIsBanned, RedirectDestination.blocked);
            return RedirectDestination.blocked;
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

    static async createNewDeviceAndUser(deviceId: string, deviceName: string):
        Promise<[ device: Device, user: User ]> {

        let username = "owner of " + deviceName;
        // set as administrator if none exist
        let userId = await User.create(UserGroup.FIRST_GROUP_ID, username, false);

        await Device.create(deviceId, userId, deviceName);
        return [ new Device(deviceId, userId, deviceName, 0),
             new User(userId, UserGroup.FIRST_GROUP_ID, username, 0, 0) ]
    }
}