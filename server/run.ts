import { DhcpServer } from "./dhcp/dhcpServer";
import { DnsServer } from "./dns/dnsServer";
import { TestSocket } from "./dns/testSocket";
import { Db } from "./db/db";
import { API as API } from "./api/api";
import { DetectNetwork } from "./localnetwork";
import * as dotenv from "dotenv";
dotenv.config();


async function run() {
    DetectNetwork.init();
    await Db.init();
    //let c = await BookedSlot.bookedSlotExistsNow(5);
    //console.log(c);
    //let q = await Quota.getByGroupIdDay(1, 0);
    //console.log(q);
    
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

    //API
    if (Number(process.env.API_ENABLED)) {
        API.init();
    }

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