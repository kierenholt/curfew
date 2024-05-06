import { spawn } from "child_process";
import { DhcpServer } from "./dhcp/dhcpServer";
import { DnsServer } from "./dns/dnsServer";
import { TestSocket } from "./dns/testSocket";
import { DomainChecker } from "./domainChecker";
import { Unicast } from "./python/unicast";

const DHCP_ENABLED = true;
const DNS_ENABLED = false;
const TEST_SOCKET = false;

async function run() {
    //DHCP SERVER
    if (DHCP_ENABLED) {
        var s = new DhcpServer();
    }

    //DNS SERVER
    if (DNS_ENABLED) {
        let checker = new DomainChecker();
        let server = new DnsServer(checker.isAllowed);
    }

    if (TEST_SOCKET) {
        let s = new TestSocket();
        s.listen();
        s.send();
    }

    //Unicast.send(Buffer.from([123,32,54,2]));
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