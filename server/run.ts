import { DhcpServer } from "./dhcp/dhcpServer";
import { DnsServer } from "./dns/dnsServer";
import { TestSocket } from "./dns/testSocket";
import { Db } from "./db/db";
import { API as API } from "./api/api";
import { Quota } from "./db/quota";

const DHCP_ENABLED = false;
const DNS_ENABLED = false;
const TEST_SOCKET = false;
const API_ENABLED = true;

async function run() {
    await Db.init();
    //let c = await BookedSlot.bookedSlotExistsNow(5);
    //console.log(c);
    let q = await Quota.getByGroupIdDay(1, 0);
    console.log(q);
    
    //DHCP SERVER
    if (DHCP_ENABLED) {
        DhcpServer.init();
    }

    //DNS SERVER
    if (DNS_ENABLED) {
        DnsServer.init();
    }

    //API
    if (API_ENABLED) {
        API.init();
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