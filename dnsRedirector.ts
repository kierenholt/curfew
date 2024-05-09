import { BookedSlot } from "./db/bookedSlot";
import { Device } from "./db/device";
import { Domain } from "./db/domain";
import { UserGroup } from "./db/userGroup";
import { FilterAction, List } from "./db/list";
import { User } from "./db/user";
import { DhcpServer } from "./dhcp/dhcpServer";


export class DnsRedirector {
    NULL_IP_v4: string = "240.0.0.0";
    NULL_IP_v6: Buffer = Buffer.from([100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]); //https://en.wikipedia.org/wiki/IPv6_address#Special_addresses
    LOCALHOST: string = "127.0.0.1";

    blackList: string[] = ["youtube","googlevideo","roblox","classroom6x","tiktok","unity","snapchat","goguardian","-tiktok","unity3d","classroom6x","goguardian","classroom6x","tiktokcdn","facebook","brawlstars","tiktokcdn-eu","tiktokv","apple","aaplimg","brawlstargame","brawlstarsgame","brawlstars","vungle","gameduo","liftoff","applovin","inner-activ","inmobicdn","inmobi","applvn","tiktokcdn-us","stats","ocsp","supercell","rbxcdn","crazygames","epicgames","epicgames","yohoho","poki","1001games","friv","numuki","coolmathgames","raft-wars","ytimg","fbcdn","brawlstars","snapchat"];
    BLOCK_IF_DOMAIN_NOT_FOUND: boolean = true;

    constructor() {

    }

    async redirect(hostAddress: string, fullDomain: string): Promise<{ isRedirected: boolean; ip4?: string, ip6?: Buffer }> {
        if (hostAddress.length == 0) throw("hostname cannot be null");
        //get MAC
        let hostMAC = DhcpServer.getMacFromIP(hostAddress);
        
        //find user
        let device = await Device.getByMac(hostMAC);

        if (device == null) { //device not found -> name the device page
            return { isRedirected: true, ip4: this.LOCALHOST };
        }
        else { //device found - get user
            let user = await User.getById(device.ownerId)
            if (user == null) {
                //user not found -> name the owner page
                return { isRedirected: true, ip4: this.LOCALHOST };
            }
            else {
                let group = await UserGroup.getById(user.groupId);
                if (group == null) {
                    //group not found -> name the group page
                    return { isRedirected: true, ip4: this.LOCALHOST };
                }
                else {
                    if (group.isUnrestricted) { //member of unrestricted group
                        return { isRedirected: false };
                    }
                    else { //restricted access
                        let listId = await Domain.getListIdFromDomain(fullDomain);
                        if (listId == null) { //domain not found -> page
                            return this.BLOCK_IF_DOMAIN_NOT_FOUND ? 
                                { isRedirected: true, ip4: this.LOCALHOST } :
                                { isRedirected: false };
                        }
                        else { //domain found
                            let list = await List.getById(listId);
                            if (list == null) { //list not found
                                return { isRedirected: true, ip4: this.LOCALHOST };
                            }
                            else { //domain is always allowed
                                if (list.filterAction == FilterAction.alwaysAllow) {
                                    return { isRedirected: false };
                                }   //domain is always blocked -> page
                                else if (list.filterAction == FilterAction.alwaysBlock) {
                                    return { isRedirected: true, ip4: this.LOCALHOST };
                                }
                                else { //needs slot
                                    //has the user booked a slot?
                                    let slotExists = await BookedSlot.bookedSlotExistsNow(user.id);
                                    if (slotExists) {
                                        return { isRedirected: false };
                                    }
                                    else { //slot not booked -> book a slot page
                                        return { isRedirected: true, ip4: this.LOCALHOST };
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return { isRedirected: true, ip4: "127.0.0.1" };
    }


}