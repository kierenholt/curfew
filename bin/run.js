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
const dnsServer_1 = require("./dns/dnsServer");
const testSocket_1 = require("./dns/testSocket");
const domainChecker_1 = require("./domainChecker");
const DHCP_ENABLED = false;
const DNS_ENABLED = true;
const TEST_SOCKET = false;
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        //DHCP SERVER
        if (DHCP_ENABLED) {
            options_1.Options.init();
            var s = new server_1.DhcpServer();
            s.listen();
        }
        //DNS SERVER
        if (DNS_ENABLED) {
            let checker = new domainChecker_1.DomainChecker();
            let server = new dnsServer_1.DnsServer(checker.isAllowed);
        }
        if (TEST_SOCKET) {
            let s = new testSocket_1.TestSocket();
            s.listen();
            s.send();
        }
    });
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
//# sourceMappingURL=run.js.map