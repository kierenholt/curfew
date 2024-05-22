import { Booking } from "./db/booking";
import { Device } from "./db/device";
import { Domain } from "./db/domain";
import { FilterAction, List } from "./db/list";
import { User } from "./db/user";
import { UserGroup } from "./db/userGroup";
import { DhcpServer } from "./dhcp/dhcpServer";
import { RedirectResult } from "./dns/dnsServer";
import { Helpers } from "./helpers";

export enum RedirectPage {
    allowPage = 0, nameTheDevicePage = 1, nameTheOwnerPage = 2,
    nameTheGroupPage = 3, domainIsBlockedPage = 4, domainNotInListPage = 5,
    bookASlotPage = 6, errorPage = 7, dashboardPage = 8,
    deviceIsBanned = 9, userIsBanned = 10, groupIsBanned = 11
}

export class Redirect {
    static BLOCK_IF_DOMAIN_NOT_FOUND: boolean = true;

    device: Device | null = null;
    owner: User | null = null;
    group: UserGroup | null = null;
    domain: Domain | null = null;
    list: List | null = null;
    bookedSlot: Booking | null = null;
    redirectResult: RedirectPage = RedirectPage.errorPage;
    createdOn: Date = new Date();

    static async create(hostAddress: string, fullDomain: string = ""): Promise<Redirect> {
        if (hostAddress.length == 0) throw("hostAddress cannot be null");
        
        let ret = new Redirect();

        //get MAC
        let deviceId = DhcpServer.getDeviceIdFromIP(hostAddress);
        
        //find user
        ret.device = await Device.getById(Helpers.MACtoDeviceId(deviceId));

        if (ret.device == null) { //device not found -> name the device page
            ret.redirectResult = RedirectPage.nameTheDevicePage;
            return ret;
        }
        else { //device found - get user
            if (ret.device.isBanned) {
                ret.redirectResult = RedirectPage.deviceIsBanned;
                return ret;    
            }
            ret.owner = await ret.device.owner;
            if (ret.owner == null) {
                //user not found -> name the owner page
                ret.redirectResult = RedirectPage.nameTheOwnerPage;
                return ret;
            }
            else {
                if (ret.owner.isBanned) {
                    ret.redirectResult = RedirectPage.userIsBanned;
                    return ret;    
                }
                ret.group = await ret.owner.group;
                if (ret.group == null) {
                    //group not found -> name the group page
                    ret.redirectResult = RedirectPage.nameTheGroupPage;
                    return ret;
                }
                else {
                    if (ret.group.isBanned) {
                        ret.redirectResult = RedirectPage.groupIsBanned;
                        return ret;    
                    }
                    if (ret.group.isUnrestricted) { //member of unrestricted group
                        ret.redirectResult = RedirectPage.allowPage;
                        return ret;
                    }
                    else { //restricted access
                        if (fullDomain == "") {
                            ret.redirectResult = RedirectPage.dashboardPage;
                            return ret;
                        }
                        ret.domain = await Domain.getFromDomainName(fullDomain);
                        if (ret.domain == null) { //domain not found -> page
                            ret.redirectResult = this.BLOCK_IF_DOMAIN_NOT_FOUND ? 
                                RedirectPage.domainIsBlockedPage :
                                RedirectPage.allowPage;
                                return ret;
                        }
                        else { //list id found
                            ret.list = await ret.domain.list;
                            if (ret.list == null) { //list not found -> page
                                ret.redirectResult = RedirectPage.domainNotInListPage;
                                return ret;
                            }
                            else { //domain is always allowed
                                if (ret.list.filterAction == FilterAction.alwaysAllow) {
                                    ret.redirectResult = RedirectPage.allowPage;
                                    return ret;
                                }   //domain is always blocked -> page
                                else if (ret.list.filterAction == FilterAction.alwaysBlock) {
                                    ret.redirectResult = RedirectPage.domainIsBlockedPage;
                                    return ret;
                                }
                                else { //needs slot
                                    //has the user booked a slot?
                                    ret.bookedSlot = null;//await Booking.bookedSlotInUse(ret.owner.id);
                                    if (ret.bookedSlot) {
                                        ret.redirectResult = RedirectPage.allowPage;
                                        return ret;
                                    }
                                    else { //slot not booked or no slots available -> book a slot page
                                        ret.redirectResult = RedirectPage.bookASlotPage;
                                        return ret;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}