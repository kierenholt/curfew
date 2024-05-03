import { DhcpClient } from "./dhcp/client";
import { CLIENT_PORT } from "./dhcp/dhcp";
import { Options } from "./dhcp/options";
import { DhcpServer } from "./dhcp/server";
import { DnsServer } from "./dns/dnsServer";
import { DomainChecker } from "./domainChecker";

async function run() {
    //DHCP SERVER
    Options.init();
    var s = new DhcpServer({
        range: [
            "192.168.0.10", "192.168.0.70"
        ],
        randomIP: true, // Get random new IP from pool instead of keeping one ip
        static: {
            //"11:22:33:44:55:66": "192.168.3.100" MACS that get static IPs
        },
        netmask: '255.255.255.0',
        router: [
            '192.168.0.1'
        ],
        dns: ["192.168.0.78"], // this is us
        broadcast: '192.168.0.255',
        server: '192.168.0.78',
        hostname: "curfew"
    });

    s.listen();


    //DNS SERVER
    let server = new DnsServer(new DomainChecker());
    await new Promise(() => {});
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