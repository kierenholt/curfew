"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DhcpServer = void 0;
const dgram_1 = require("dgram");
const dhcp_1 = require("./dhcp");
const lease_1 = require("./lease");
const request_1 = require("./request");
const seqbuffer_1 = require("./seqbuffer");
const options_1 = require("./options");
const Tools = require('./tools.js');
class DhcpServer {
    constructor() {
        // Config (cache) object
        this._conf = null;
        // All mac -> IP mappings, we currently have assigned or blacklisted
        this._state = {};
        // Incoming request
        this._req = null;
        this._conf = {
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
        };
        this._sock = (0, dgram_1.createSocket)({ type: 'udp4', reuseAddr: true });
        this._sock.bind(dhcp_1.SERVER_PORT, dhcp_1.INADDR_ANY, () => {
            this._sock.setBroadcast(true);
            console.log('DHCP listening on port', this._sock);
        });
        this._sock.on('message', (buf) => {
            let req;
            req = new request_1.DhcpRequest(buf);
            this._req = req;
            if (req.op !== dhcp_1.BOOTREQUEST) {
                //this.emit('error', new Error('Malformed packet'), req);
                return;
            }
            if (!req.options[53]) {
                console.error('Got message, without valid message type', req);
                return;
            }
            // Handle request
            switch (req.options[53]) {
                case dhcp_1.DHCPDISCOVER: // 1.
                    this.handleDiscover(req);
                    break;
                case dhcp_1.DHCPREQUEST: // 3.
                    this.handleRequest(req);
                    break;
                default:
                    console.error("Not implemented method", req.options[53]);
            }
        });
        this._sock.on('error', (e) => {
            throw (e);
        });
    }
    config(key) {
        let val;
        const optId = options_1.Options.conf[key];
        // If config setting is set by user
        if (undefined !== this._conf[key]) {
            val = this._conf[key];
        }
        else if (undefined !== options_1.Options.opts[optId]) {
            val = options_1.Options.opts[optId].default;
            if (val === undefined)
                return 0; // Better idea?
        }
        else {
            throw new Error('Invalid option ' + key);
        }
        // If a function was provided
        if (val instanceof Function) {
            /*
            var reqOpt: any = {};
            for (var i in this._req.options) {
                var opt = Options.opts[i];
                if (opt.enum) {
                    reqOpt[opt.attr || i] = opt.enum[this._req.options[i]];
                } else {
                    reqOpt[opt.attr || i] = this._req.options[i];
                }
            }
            val = val.call(this, reqOpt);
            */
            val = val(this);
        }
        // If the option has an "enum" attribute:
        if (key !== 'range' && key !== 'static' && key !== 'randomIP' && options_1.Options.opts[optId].enum) {
            const values = options_1.Options.opts[optId].enum;
            // Check if value is an actual enum string
            for (let i in values) {
                if (values[i] === val) {
                    return parseInt(i, 10);
                }
            }
            // Okay, check  if it is the numeral value of the enum
            if (values[val] === undefined) {
                throw new Error('Provided enum value for ' + key + ' is not valid');
            }
            else {
                val = parseInt(val, 10);
            }
        }
        return val;
    }
    _getOptions(pre, required, requested = []) {
        for (let req of required) {
            // Check if option id actually exists
            if (options_1.Options.opts[req] !== undefined) {
                // Take the first config value always
                if (pre[req] === undefined) {
                    pre[req] = this.config(options_1.Options.opts[req].config);
                }
                if (!pre[req]) {
                    throw new Error('Required option ' + options_1.Options.opts[req].config + ' does not have a value set');
                }
            }
            else {
                console.error('error Unknown option ' + req);
            }
        }
        // Add all values, the user wants, which are not already provided:
        if (requested) {
            for (let req of requested) {
                // Check if option id actually exists
                if (options_1.Options.opts[req] !== undefined) {
                    // Take the first config value always
                    if (pre[req] === undefined) {
                        const val = this.config(options_1.Options.opts[req].config);
                        // Add value only, if it's meaningful
                        if (val) {
                            pre[req] = val;
                        }
                    }
                }
                else {
                    //this.emit('error', 'Unknown option ' + req);
                }
            }
        }
        // Finally Add all missing and forced options
        const forceOptions = this._conf.forceOptions;
        if (forceOptions instanceof Array) {
            for (let option of forceOptions) {
                // Add numeric options right away and look up alias names
                let id;
                if (isNaN(option)) {
                    id = options_1.Options.conf[option];
                }
                else {
                    id = option;
                }
                // Add option if it is valid and not present yet
                if (id !== undefined && pre[id] === undefined) {
                    pre[id] = this.config(option);
                }
            }
        }
        return pre;
    }
    _selectAddress(clientMAC, req = []) {
        /*
        * IP Selection algorithm:
        *
        * 0. Is Mac already known, send same IP of known lease
        *
        * 1. Is there a wish for static binding?
        *
        * 2. Are all available IP's occupied?
        *    - Send release to oldest lease and reuse
        *
        * 3. is config randomIP?
        *    - Select random IP of range, until no occupied slot is found
        *
        * 4. Take first unmapped IP of range
        *
        * TODO:
        * - Incorporate user preference, sent to us
        * - Check APR if IP exists on net
        */
        // If existing lease for a mac address is present, re-use the IP
        if (this._state[clientMAC] && this._state[clientMAC].address) {
            return this._state[clientMAC].address;
        }
        // Is there a static binding?
        const _static = this.config('static');
        if (typeof _static === "function") {
            const staticResult = _static(clientMAC, req);
            if (staticResult)
                return staticResult;
        }
        else if (_static[clientMAC]) {
            return _static[clientMAC];
        }
        const randIP = this.config('randomIP');
        const _tmp = this.config('range');
        const firstIP = Tools.parseIp(_tmp[0]);
        const lastIP = Tools.parseIp(_tmp[1]);
        // Add all known addresses and save the oldest lease
        const ips = [this.config('server')]; // Exclude our own server IP from pool
        let oldestMac = null;
        let oldestTime = Infinity;
        let leases = 0;
        for (let mac in this._state) {
            if (this._state[mac].address)
                ips.push(this._state[mac].address);
            if (this._state[mac].leaseTime < oldestTime) {
                oldestTime = this._state[mac].leaseTime;
                oldestMac = mac;
            }
            leases++;
        }
        // Check if all IP's are used and delete the oldest
        if (oldestMac !== null && lastIP - firstIP === leases) {
            const ip = this._state[oldestMac].address;
            // TODO: Notify deleted client
            delete this._state[oldestMac];
            return ip;
        }
        // Select a random IP, maybe not the best algorithm for quick selection if lots of ip's are given: TODO
        if (randIP) {
            while (1) {
                const ip = Tools.formatIp(firstIP + Math.random() * (lastIP - firstIP) | 0);
                if (ips.indexOf(ip) === -1) {
                    return ip;
                }
            }
        }
        // Choose first free IP in subnet
        for (let i = firstIP; i <= lastIP; i++) {
            const ip = Tools.formatIp(i);
            if (ips.indexOf(ip) === -1) {
                return ip;
            }
        }
    }
    handleDiscover(req) {
        //console.log('Handle Discover', req);
        const lease = this._state[req.chaddr] = this._state[req.chaddr] || new lease_1.Lease();
        lease.address = this._selectAddress(req.chaddr, req);
        lease.leasePeriod = this.config('leaseTime');
        lease.server = this.config('server');
        lease.state = 'OFFERED';
        //console.log('discovery message from : ', JSON.stringify(req));
        // Formulate the response object
        const ans = {
            op: dhcp_1.BOOTREPLY,
            htype: 1, // RFC1700, hardware types: 1=Ethernet, 2=Experimental, 3=AX25, 4=ProNET Token Ring, 5=Chaos, 6=Tokenring, 7=Arcnet, 8=FDDI, 9=Lanstar (keep it constant)
            hlen: 6, // Mac addresses are 6 byte
            hops: 0,
            xid: req.xid, // 'xid' from client DHCPDISCOVER message
            secs: 0,
            flags: req.flags,
            ciaddr: dhcp_1.INADDR_ANY,
            yiaddr: this._selectAddress(req.chaddr), // My offer
            siaddr: this.config('server'), // next server in bootstrap. That's us
            giaddr: req.giaddr,
            chaddr: req.chaddr, // Client mac address
            sname: '',
            file: '',
            options: this._getOptions({
                53: dhcp_1.DHCPOFFER
            }, [
                1, 3, 51, 54, 6
            ], req.options[55])
        };
        // Send the actual data
        // INADDR_BROADCAST : 68 <- SERVER_IP : 67
        //console.log('sending offer:', JSON.stringify(ans));
        this._send(this.config('broadcast'), ans);
    }
    handleRequest(req) {
        //console.log('accept offer from ', JSON.stringify(req));
        const lease = this._state[req.chaddr] = this._state[req.chaddr] || new lease_1.Lease;
        lease.address = this._selectAddress(req.chaddr);
        lease.leasePeriod = this.config('leaseTime');
        lease.server = this.config('server');
        lease.state = 'BOUND';
        lease.bindTime = new Date;
        //console.log('Send ACK');
        // Formulate the response object
        const ans = {
            op: dhcp_1.BOOTREPLY,
            htype: 1, // RFC1700, hardware types: 1=Ethernet, 2=Experimental, 3=AX25, 4=ProNET Token Ring, 5=Chaos, 6=Tokenring, 7=Arcnet, 8=FDDI, 9=Lanstar (keep it constant)
            hlen: 6, // Mac addresses are 6 byte
            hops: 0,
            xid: req.xid, // 'xid' from client DHCPREQUEST message
            secs: 0,
            flags: req.flags, // 'flags' from client DHCPREQUEST message
            ciaddr: req.ciaddr,
            yiaddr: this._selectAddress(req.chaddr), // my offer
            siaddr: this.config('server'), // server ip, that's us
            giaddr: req.giaddr, // 'giaddr' from client DHCPREQUEST message
            chaddr: req.chaddr, // 'chaddr' from client DHCPREQUEST message
            sname: '',
            file: '',
            options: this._getOptions({
                53: dhcp_1.DHCPACK
            }, [
                1, 3, 51, 54, 6
            ], req.options[55])
        };
        // Send the actual data
        // INADDR_BROADCAST : 68 <- SERVER_IP : 67
        //console.log('acknowledge sent to ',JSON.stringify(ans));
        this._send(this.config('broadcast'), ans);
    }
    handleRelease() { }
    handleRenew() { }
    _send(host, req) {
        const sb = seqbuffer_1.SeqBuffer.fromRequest(req);
        this._sock.send(sb._data, 0, sb._w, dhcp_1.CLIENT_PORT, host, (err, bytes) => {
            if (err) {
                console.log(err);
            }
            else {
                //console.log('Sent ', bytes, 'bytes');
            }
        });
    }
}
exports.DhcpServer = DhcpServer;
/*
    //NOT USED
    sendNak(req: IRequest) {
        //console.log('Send NAK');
        // Formulate the response object
        const ans = {
            op: BOOTREPLY,
            htype: 1, // RFC1700, hardware types: 1=Ethernet, 2=Experimental, 3=AX25, 4=ProNET Token Ring, 5=Chaos, 6=Tokenring, 7=Arcnet, 8=FDDI, 9=Lanstar (keep it constant)
            hlen: 6, // Mac addresses are 6 byte
            hops: 0,
            xid: req.xid, // 'xid' from client DHCPREQUEST message
            secs: 0,
            flags: req.flags, // 'flags' from client DHCPREQUEST message
            ciaddr: INADDR_ANY,
            yiaddr: INADDR_ANY,
            siaddr: INADDR_ANY,
            giaddr: req.giaddr, // 'giaddr' from client DHCPREQUEST message
            chaddr: req.chaddr, // 'chaddr' from client DHCPREQUEST message
            sname: '', // unused
            file: '', // unused
            options: this._getOptions({
                53: DHCPNAK
            }, [
                54
            ])
        };

        // Send the actual data
        
        this._send(this.config('broadcast'), ans);
    }
    */ 
//# sourceMappingURL=server.js.map