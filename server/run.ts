import { DhcpServer } from "./dhcp/dhcpServer";
import { DnsServer } from "./dns/dnsServer";
import { TestSocket } from "./dns/testSocket";
import { Db } from "./db/db";
import { API as API } from "./api/api";
import { DetectNetwork } from "./localnetwork";
import * as dotenv from "dotenv";
import { Setting, SettingKey } from "./db/setting";
import { DnsRequest } from "./db/dnsRequest";
import { Jobs } from "./jobs";
import { MDnsServer } from "./dns/mdnsServer";

dotenv.config();


async function run() {
    DetectNetwork.init();
    await Db.init();
    //let c = await BookedSlot.bookedSlotExistsNow(5);
    //let deleted = await DnsRequest.deleteOlderThanDays(4);
    //console.log(deleted);
    //await Setting.create(SettingKey.showNonAdminsNameChangeLink, "1", "allow name change on home page", "when you click the name or device on the homepage, an edit page will show. Best to disable this once everything is set up.");
    //await Setting.create(SettingKey.viewDeleted, "0", "view deleted devices users and groups", "if enabled, deleted items will show up on the groups page");


    //DHCP SERVER
    if (Number(process.env.DHCP_ENABLED)) {
        DhcpServer.init();
    }
    if (Number(process.env.DHCP_MOCKED)) {
        DhcpServer.addDebugLeases();
    }
    
    //DNS SERVER
    if (Number(process.env.DNS_ENABLED)) {
        DnsServer.init();
    }
    
    //MDNS SERVER
    if (Number(process.env.MDNS_ENABLED)) {
        MDnsServer.init();
    }

    //API
    if (Number(process.env.API_ENABLED)) {
        API.init();
    }
    
    Jobs.init();

    if (Number(process.env.TEST_SOCKET)) {
        let s = new TestSocket();
        s.listen();
        s.send();
    }
}
run();


/*
    //DHCP CLIENT
    const c = new DhcpClient({});

    s.on('bound', function (state) {
        console.log("State: ", state);
    });
  
    c.listen(CLIENT_PORT, "0.0.0.0", () => {
        console.log("sending discover");
        c.sendDiscover();
    });
*/