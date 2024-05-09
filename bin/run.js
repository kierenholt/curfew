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
const dhcpServer_1 = require("./dhcp/dhcpServer");
const dnsServer_1 = require("./dns/dnsServer");
const testSocket_1 = require("./dns/testSocket");
const db_1 = require("./db/db");
const httpServer_1 = require("./http/httpServer");
const bookedSlot_1 = require("./db/bookedSlot");
const DHCP_ENABLED = false;
const DNS_ENABLED = false;
const TEST_SOCKET = false;
const HTTP_ENABLED = true;
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        yield db_1.Db.init();
        let c = yield bookedSlot_1.BookedSlot.bookedSlotExistsNow(5);
        console.log(c);
        console.log("end");
        //DHCP SERVER
        if (DHCP_ENABLED) {
            dhcpServer_1.DhcpServer.init();
        }
        //DNS SERVER
        if (DNS_ENABLED) {
            dnsServer_1.DnsServer.init();
        }
        //HTTP SERVER
        if (HTTP_ENABLED) {
            httpServer_1.HttpServer.init();
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