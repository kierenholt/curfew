import { DhcpClient } from "./dhcp/client";
import { CLIENT_PORT } from "./dhcp/dhcp";
import { Options } from "./dhcp/options";
import { DhcpServer } from "./dhcp/server";
import { DnsServer } from "./dns/dnsServer";
import { TestSocket } from "./dns/testSocket";
import { DomainChecker } from "./domainChecker";

const DHCP_ENABLED = false;
const DNS_ENABLED = true;
const TEST_SOCKET = false;

async function run() {
    //DHCP SERVER
    if (DHCP_ENABLED) {
        Options.init();
        var s = new DhcpServer();
        s.listen();
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