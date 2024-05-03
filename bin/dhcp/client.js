"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DhcpClient = void 0;
const dhcp_1 = require("./dhcp");
const lease_1 = require("./lease");
const events_1 = __importDefault(require("events"));
const options_1 = require("./options");
const request_1 = require("./request");
const seqbuffer_1 = require("./seqbuffer");
const dgram = require('dgram');
const os = require('os');
const Tools = require('./tools.js');
class DhcpClient extends events_1.default {
    constructor(config) {
        super();
        // Config (cache) object
        this._conf = null;
        // Current client state
        this._state = null;
        // Incoming request
        this._req = null;
        const sock = dgram.createSocket({ type: 'udp4', reuseAddr: true });
        sock.on('message', (buf) => {
            let req;
            try {
                req = new request_1.DhcpRequest(buf);
            }
            catch (e) {
                this.emit('error', e);
                return;
            }
            this._req = req;
            if (req.op !== dhcp_1.BOOTREPLY) {
                //this.emit('error', new Error('Malformed packet'), req);
                return;
            }
            if (!req.options[53]) {
                this.emit('error', new Error('Got message, without valid message type'), req);
                return;
            }
            this.emit('message', req);
            // Handle request
            switch (req.options[53]) {
                case dhcp_1.DHCPOFFER: // 2.
                    this.handleOffer(req);
                    break;
                case dhcp_1.DHCPACK: // 4.
                case dhcp_1.DHCPNAK: // 4.
                    this.handleAck(req);
                    break;
            }
        });
        sock.on('listening', () => {
            this.emit('listening', sock);
        });
        sock.on('close', () => {
            this.emit('close');
        });
        this._sock = sock;
        this._conf = config || {};
        this._state = new lease_1.Lease();
    }
    config(key) {
        if (key === 'mac') {
            if (this._conf.mac === undefined) {
                const interfaces = os.networkInterfaces();
                for (let intf in interfaces) {
                    const addresses = interfaces[intf];
                    for (let address in addresses) {
                        if (addresses[address].family === 'IPv4' && !addresses[address].internal) {
                            if (this._conf.mac === undefined) {
                                this._conf.mac = addresses[address].mac;
                            }
                            else {
                                throw new Error('Too many network interfaces, set mac address manually:\n\tclient = dhcp.createClient({mac: "12:23:34:45:56:67"});');
                            }
                        }
                    }
                }
            }
            return this._conf.mac;
        }
        else if (key === 'features') {
            // Default list we request
            const def = [
                1, // netmask
                3, // routers
                51, // lease time
                54, // server ID
                6 // DNS
            ];
            const ft = this._conf.features;
            if (ft) {
                for (let f of ft) {
                    let id = options_1.Options.conf[f];
                    if (id) {
                        id = parseInt(id, 10);
                        if (def.indexOf(id) === -1) {
                            def.push(id);
                        }
                    }
                    else {
                        throw new Error('Unknown option ' + f);
                    }
                }
                return def;
            }
        }
        else {
            throw new Error('Unknown config key ' + key);
        }
    }
    sendDiscover() {
        //console.log('Send Discover');
        const mac = this.config('mac');
        // Formulate the response object
        const ans = {
            op: dhcp_1.BOOTREQUEST,
            htype: 1, // RFC1700, hardware types: 1=Ethernet, 2=Experimental, 3=AX25, 4=ProNET Token Ring, 5=Chaos, 6=Tokenring, 7=Arcnet, 8=FDDI, 9=Lanstar (keep it constant)
            hlen: 6, // Mac addresses are 6 byte
            hops: 0,
            xid: this._state.xid++, // Selected by client on DHCPDISCOVER
            secs: 0, // 0 or seconds since DHCP process started
            flags: 0, // 0 or 0x80 (if client requires broadcast reply)
            ciaddr: dhcp_1.INADDR_ANY, // 0 for DHCPDISCOVER, other implementations send currently assigned IP - but we follow RFC
            yiaddr: dhcp_1.INADDR_ANY,
            siaddr: dhcp_1.INADDR_ANY,
            giaddr: dhcp_1.INADDR_ANY,
            chaddr: mac,
            sname: '', // unused
            file: '', // unused
            options: {
                57: 1500, // Max message size
                53: dhcp_1.DHCPDISCOVER,
                61: mac, // MAY
                55: this.config('features') // MAY
                // TODO: requested IP optional
            }
        };
        this._state.state = 'SELECTING';
        this._state.tries = 0;
        // TODO: set timeouts
        // Send the actual data
        // INADDR_ANY : 68 -> INADDR_BROADCAST : 67
        this._send(dhcp_1.INADDR_BROADCAST, ans);
    }
    handleOffer(req) {
        //console.log('Handle Offer', req);
        // Select an offer out of all offers
        // We simply take the first one and change the state then
        if (req.options[54]) {
            // Check if we already sent a request to the first appearing server
            if (this._state.state !== 'REQUESTING') {
                this.sendRequest(req);
            }
        }
        else {
            this.emit('error', 'Offer does not have a server identifier', req);
        }
    }
    sendRequest(req) {
        //console.log('Send Request');
        // Formulate the response object
        const ans = {
            op: dhcp_1.BOOTREQUEST,
            htype: 1, // RFC1700, hardware types: 1=Ethernet, 2=Experimental, 3=AX25, 4=ProNET Token Ring, 5=Chaos, 6=Tokenring, 7=Arcnet, 8=FDDI, 9=Lanstar (keep it constant)
            hlen: 6, // Mac addresses are 6 byte
            hops: 0,
            xid: req.xid, // 'xid' from server DHCPOFFER message
            secs: 0, // 0 or seconds since DHCP process started
            flags: 0, // 0 or 0x80 (if client requires broadcast reply)
            ciaddr: dhcp_1.INADDR_ANY, // 0 for DHCPREQUEST
            yiaddr: dhcp_1.INADDR_ANY,
            siaddr: dhcp_1.INADDR_ANY,
            giaddr: dhcp_1.INADDR_ANY,
            chaddr: this.config('mac'),
            sname: '', // unused
            file: '', // unused
            options: {
                57: 1500, // Max message size
                53: dhcp_1.DHCPREQUEST,
                61: this.config('mac'), // MAY
                55: this.config('features'), // MAY
                50: this._state.address, // requested IP, TODO: MUST (selecting or INIT REBOOT) MUST NOT (BOUND, RENEW)
                // TODO: server identifier: MUST (after selecting) MUST NOT (INIT REBOOT, BOUND, RENEWING, REBINDING)
            }
        };
        this._state.server = req.options[54];
        this._state.address = req.yiaddr;
        this._state.state = 'REQUESTING';
        this._state.tries = 0;
        // TODO: retry timeout
        // INADDR_ANY : 68 -> INADDR_BROADCAST : 67
        this._send(dhcp_1.INADDR_BROADCAST, ans);
    }
    handleAck(req) {
        if (req.options[53] === dhcp_1.DHCPACK) {
            // We now know the IP for sure
            //console.log('Handle ACK', req);
            this._state.bindTime = new Date;
            this._state.state = 'BOUND';
            this._state.address = req.yiaddr;
            this._state.options = {};
            // Lease time is available
            if (req.options[51]) {
                this._state.leasePeriod = req.options[51];
                this._state.renewPeriod = req.options[51] / 2;
                this._state.rebindPeriod = req.options[51];
            }
            // Renewal time is available
            if (req.options[58]) {
                this._state.renewPeriod = req.options[58];
            }
            // Rebinding time is available
            if (req.options[59]) {
                this._state.rebindPeriod = req.options[59];
            }
            // TODO: set renew & rebind timer
            const options = req.options;
            this._state.options = {};
            // Map all options from request
            for (let id in options) {
                if (id === '53' || id === '51' || id === '58' || id === '59')
                    continue;
                const conf = options_1.Options.opts[id];
                const key = conf.config || conf.attr;
                if (conf.enum) {
                    this._state.options[key] = conf.enum[options[id]];
                }
                else {
                    this._state.options[key] = options[id];
                }
            }
            // If netmask is not given, set it to a class related mask
            if (!this._state.options.netmask) {
                this._state.options.netmask = Tools.formatIp(Tools.netmaskFromIP(this._state.address));
            }
            const cidr = Tools.CIDRFromNetmask(this._state.options.netmask);
            // If router is not given, guess one
            if (!this._state.options.router) {
                this._state.options.router = Tools.formatIp(Tools.gatewayFromIpCIDR(this._state.address, cidr));
            }
            // If broadcast is missing
            if (!this._state.options.broadcast) {
                this._state.options.broadcast = Tools.formatIp(Tools.broadcastFromIpCIDR(this._state.address, cidr));
            }
            this.emit('bound', this._state);
        }
        else {
            // We're sorry, today we have no IP for you...
        }
    }
    sendRelease(req) {
        //console.log('Send Release');
        // Formulate the response object
        const ans = {
            op: dhcp_1.BOOTREQUEST,
            htype: 1, // RFC1700, hardware types: 1=Ethernet, 2=Experimental, 3=AX25, 4=ProNET Token Ring, 5=Chaos, 6=Tokenring, 7=Arcnet, 8=FDDI, 9=Lanstar (keep it constant)
            hlen: 6, // Mac addresses are 6 byte
            hops: 0,
            xid: this._state.xid++, // Selected by client on DHCPRELEASE
            secs: 0, // 0 or seconds since DHCP process started
            flags: 0,
            ciaddr: this.config('server'),
            yiaddr: dhcp_1.INADDR_ANY,
            siaddr: dhcp_1.INADDR_ANY,
            giaddr: dhcp_1.INADDR_ANY,
            chaddr: this.config('mac'),
            sname: '', // unused
            file: '', // unused
            options: {
                53: dhcp_1.DHCPRELEASE,
                // TODO: MAY clientID
                54: this._state.server // MUST server identifier
            }
        };
        this._state.bindTime = null;
        this._state.state = 'RELEASED';
        this._state.tries = 0;
        this.emit('released');
        // Send the actual data
        this._send(this._state.server, ans); // Send release directly to server
    }
    sendRenew() {
        //console.log('Send Renew');
        // TODO: check ans against rfc
        // Formulate the response object
        const ans = {
            op: dhcp_1.BOOTREQUEST,
            htype: 1, // RFC1700, hardware types: 1=Ethernet, 2=Experimental, 3=AX25, 4=ProNET Token Ring, 5=Chaos, 6=Tokenring, 7=Arcnet, 8=FDDI, 9=Lanstar (keep it constant)
            hlen: 6, // Mac addresses are 6 byte
            hops: 0,
            xid: this._state.xid++, // Selected by client on DHCPRELEASE
            secs: 0, // 0 or seconds since DHCP process started
            flags: 0,
            ciaddr: this.config('server'),
            yiaddr: dhcp_1.INADDR_ANY,
            siaddr: dhcp_1.INADDR_ANY,
            giaddr: dhcp_1.INADDR_ANY,
            chaddr: this.config('mac'),
            sname: '', // unused
            file: '', // unused
            options: {
                53: dhcp_1.DHCPREQUEST,
                50: this._state.address,
                // TODO: MAY clientID
                54: this._state.server // MUST server identifier
            }
        };
        this._state.state = 'RENEWING';
        this._state.tries = 0;
        // Send the actual data
        this._send(this._state.server, ans); // Send release directly to server
    }
    sendRebind() {
        //console.log('Send Rebind');
        // TODO: check ans against rfc
        // Formulate the response object
        const ans = {
            op: dhcp_1.BOOTREQUEST,
            htype: 1, // RFC1700, hardware types: 1=Ethernet, 2=Experimental, 3=AX25, 4=ProNET Token Ring, 5=Chaos, 6=Tokenring, 7=Arcnet, 8=FDDI, 9=Lanstar (keep it constant)
            hlen: 6, // Mac addresses are 6 byte
            hops: 0,
            xid: this._state.xid++, // Selected by client on DHCPRELEASE
            secs: 0, // 0 or seconds since DHCP process started
            flags: 0,
            ciaddr: this.config('server'),
            yiaddr: dhcp_1.INADDR_ANY,
            siaddr: dhcp_1.INADDR_ANY,
            giaddr: dhcp_1.INADDR_ANY,
            chaddr: this.config('mac'),
            sname: '', // unused
            file: '', // unused
            options: {
                53: dhcp_1.DHCPREQUEST,
                50: this._state.address,
                // TODO: MAY clientID
                54: this._state.server // MUST server identifier
            }
        };
        this._state.state = 'REBINDING';
        this._state.tries = 0;
        // TODO: timeout
        // Send the actual data
        this._send(dhcp_1.INADDR_BROADCAST, ans); // Send release directly to server
    }
    listen(port = dhcp_1.CLIENT_PORT, host = dhcp_1.INADDR_ANY, fn) {
        this._sock.bind(port, host, () => {
            this._sock.setBroadcast(true);
            if (fn instanceof Function) {
                process.nextTick(fn);
            }
        });
    }
    close(callback) {
        this._sock.close(callback);
    }
    _send(host, data) {
        const sb = seqbuffer_1.SeqBuffer.fromRequest(data);
        this._sock.send(sb._data, 0, sb._w, dhcp_1.SERVER_PORT, host, (err, bytes) => {
            if (err) {
                console.log(err);
            }
            else {
                //console.log('Sent ', bytes, 'bytes');
            }
        });
    }
}
exports.DhcpClient = DhcpClient;
//# sourceMappingURL=client.js.map