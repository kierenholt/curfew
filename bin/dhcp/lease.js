"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lease = exports.LeaseState = void 0;
var LeaseState;
(function (LeaseState) {
    LeaseState[LeaseState["offered"] = 0] = "offered";
    LeaseState[LeaseState["active"] = 1] = "active";
    LeaseState[LeaseState["expired"] = 2] = "expired";
})(LeaseState || (exports.LeaseState = LeaseState = {}));
class Lease {
    constructor(MAC, IP, mostRecentTransactionId) {
        this.MAC = MAC;
        this.IP = IP;
        this.state = LeaseState.active;
        this.expires = new Date().valueOf() + Lease.lifetime;
        this.mostRecentTransactionId = mostRecentTransactionId;
    }
}
exports.Lease = Lease;
Lease.lifetime = 86400;
//# sourceMappingURL=lease.js.map