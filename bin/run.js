"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const options_1 = require("./dhcp/options");
const server_1 = require("./dhcp/server");
const dnsSocket_1 = require("./dnsSocket");
const domainChecker_1 = require("./domainChecker");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        //DHCP SERVER
        options_1.Options.init();
        var s = new server_1.DhcpServer({
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
        let server = new dnsSocket_1.DnsSocket(new domainChecker_1.DomainChecker());
        yield new Promise(() => { });
    });
}
run();
//# sourceMappingURL=run.js.map