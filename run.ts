import { DhcpServer } from "./dhcp/dhcpServer";
import { DnsServer } from "./dns/dnsServer";
import { TestSocket } from "./dns/testSocket";
import { Db } from "./db/db";
import { User } from "./db/user";
import { HttpServer } from "./http/httpServer";
import { UserGroup } from "./db/userGroup";
import { Domain } from "./db/domain";
import { BookedSlot } from "./db/bookedSlot";

const DHCP_ENABLED = false;
const DNS_ENABLED = false;
const TEST_SOCKET = false;
const HTTP_ENABLED = true;

async function run() {
    await Db.init();
    let c = await BookedSlot.bookedSlotExistsNow(5);
    console.log(c);
    console.log("end")

    //DHCP SERVER
    if (DHCP_ENABLED) {
        DhcpServer.init();
    }

    //DNS SERVER
    if (DNS_ENABLED) {
        DnsServer.init();
    }

    //HTTP SERVER
    if (HTTP_ENABLED) {
        HttpServer.init();
    }

    if (TEST_SOCKET) {
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