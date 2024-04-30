"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lease = void 0;
class Lease {
    constructor() {
        this.bindTime = null; // Time when we got an ACK
        this.leasePeriod = 86400; // Seconds the lease is allowed to live, next lease in "leasePeriod - (now - bindTime)"
        this.renewPeriod = 1440; // Seconds till a renew is due, next renew in "renewPeriod - (now - bindTime)"
        this.rebindPeriod = 14400; // Seconds till a rebind is due, next rebind in "rebindPeriod - (now - bindTime)"
        this.state = null; // Current State, like BOUND, INIT, REBOOTING, ...
        this.server = null; // The server we got our config from
        this.address = null; // actual IP address we got
        this.options = null; // object of all other options we got
        this.tries = 0; // number of tries in order to complete a state
        this.xid = 1; // unique id, incremented with every request
    }
}
exports.Lease = Lease;
//# sourceMappingURL=lease.js.map