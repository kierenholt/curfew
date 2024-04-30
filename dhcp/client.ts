import { Socket } from "dgram";
import { BOOTREPLY, BOOTREQUEST, DHCPACK, DHCPDISCOVER, DHCPNAK, DHCPOFFER, DHCPRELEASE, DHCPREQUEST, INADDR_ANY, INADDR_BROADCAST } from "./dhcp";
import { Lease } from "./lease";


const dgram = require('dgram');
const os = require('os');
const EventEmitter = require('events').EventEmitter;

const Options = require('./options.js');
const Protocol = require('./protocol.js');
const Tools = require('./tools.js');

const SERVER_PORT = 67;
const CLIENT_PORT = 68;

export class DhcpClient extends EventEmitter {
    // Socket handle
    _sock: any = null;

    // Config (cache) object
    _conf: any = null;

    // Current client state
    _state: any = null;

    // Incoming request
    _req: any = null;

    constructor(config: any) {
        super();

        const sock: Socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });

        sock.on('message', (buf: any) => {

            let req;

            try {
                req = Protocol.parse(buf);
            } catch (e) {
                this.emit('error', e);
                return;
            }

            this._req = req;

            if (req.op !== BOOTREPLY) {
                this.emit('error', new Error('Malformed packet'), req);
                return;
            }

            if (!req.options[53]) {
                this.emit('error', new Error('Got message, without valid message type'), req);
                return;
            }

            this.emit('message', req);

            // Handle request
            switch (req.options[53]) {
                case DHCPOFFER: // 2.
                    this.handleOffer(req);
                    break;
                case DHCPACK: // 4.
                case DHCPNAK: // 4.
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
        this._state = new Lease();
    }


    config(key: any) {

        if (key === 'mac') {

            if (this._conf.mac === undefined) {

                const interfaces = os.networkInterfaces();

                for (let intf in interfaces) {
                    const addresses = interfaces[intf];
                    for (let address in addresses) {
                        if (addresses[address].family === 'IPv4' && !addresses[address].internal) {

                            if (this._conf.mac === undefined) {
                                this._conf.mac = addresses[address].mac;
                            } else {
                                throw new Error('Too many network interfaces, set mac address manually:\n\tclient = dhcp.createClient({mac: "12:23:34:45:56:67"});');
                            }
                        }
                    }
                }
            }
            return this._conf.mac;

        } else if (key === 'features') {

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

                    let id = Options.conf[f];
                    if (id) {

                        id = parseInt(id, 10);

                        if (def.indexOf(id) === -1) {
                            def.push(id);
                        }

                    } else {
                        throw new Error('Unknown option ' + f);
                    }
                }

                return def;
            }

        } else {
            throw new Error('Unknown config key ' + key);
        }
    }

    sendDiscover() {

        //console.log('Send Discover');

        const mac = this.config('mac');

        // Formulate the response object
        const ans = {
            op: BOOTREQUEST,
            htype: 1, // RFC1700, hardware types: 1=Ethernet, 2=Experimental, 3=AX25, 4=ProNET Token Ring, 5=Chaos, 6=Tokenring, 7=Arcnet, 8=FDDI, 9=Lanstar (keep it constant)
            hlen: 6, // Mac addresses are 6 byte
            hops: 0,
            xid: this._state.xid++, // Selected by client on DHCPDISCOVER
            secs: 0, // 0 or seconds since DHCP process started
            flags: 0, // 0 or 0x80 (if client requires broadcast reply)
            ciaddr: INADDR_ANY, // 0 for DHCPDISCOVER, other implementations send currently assigned IP - but we follow RFC
            yiaddr: INADDR_ANY,
            siaddr: INADDR_ANY,
            giaddr: INADDR_ANY,
            chaddr: mac,
            sname: '', // unused
            file: '', // unused
            options: {
                57: 1500, // Max message size
                53: DHCPDISCOVER,
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
        this._send(INADDR_BROADCAST, ans);
    }

    handleOffer(req: any) {
        //console.log('Handle Offer', req);

        // Select an offer out of all offers
        // We simply take the first one and change the state then

        if (req.options[54]) {
            // Check if we already sent a request to the first appearing server
            if (this._state.state !== 'REQUESTING') {
                this.sendRequest(req);
            }
        } else {
            this.emit('error', 'Offer does not have a server identifier', req);
        }
    }

    sendRequest(req: any) {

        //console.log('Send Request');

        // Formulate the response object
        const ans = {
            op: BOOTREQUEST,
            htype: 1, // RFC1700, hardware types: 1=Ethernet, 2=Experimental, 3=AX25, 4=ProNET Token Ring, 5=Chaos, 6=Tokenring, 7=Arcnet, 8=FDDI, 9=Lanstar (keep it constant)
            hlen: 6, // Mac addresses are 6 byte
            hops: 0,
            xid: req.xid, // 'xid' from server DHCPOFFER message
            secs: 0, // 0 or seconds since DHCP process started
            flags: 0, // 0 or 0x80 (if client requires broadcast reply)
            ciaddr: INADDR_ANY, // 0 for DHCPREQUEST
            yiaddr: INADDR_ANY,
            siaddr: INADDR_ANY,
            giaddr: INADDR_ANY,
            chaddr: this.config('mac'),
            sname: '', // unused
            file: '', // unused
            options: {
                57: 1500, // Max message size
                53: DHCPREQUEST,
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
        this._send(INADDR_BROADCAST, ans);
    }

    handleAck(req: any) {

        if (req.options[53] === DHCPACK) {
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

                const conf = Options.opts[id];
                const key = conf.config || conf.attr;

                if (conf.enum) {
                    this._state.options[key] = conf.enum[options[id]];
                } else {
                    this._state.options[key] = options[id];
                }
            }

            // If netmask is not given, set it to a class related mask
            if (!this._state.options.netmask) {

                this._state.options.netmask = Tools.formatIp(
                    Tools.netmaskFromIP(this._state.address));
            }

            const cidr = Tools.CIDRFromNetmask(this._state.options.netmask);

            // If router is not given, guess one
            if (!this._state.options.router) {
                this._state.options.router = Tools.formatIp(
                    Tools.gatewayFromIpCIDR(this._state.address, cidr));
            }

            // If broadcast is missing
            if (!this._state.options.broadcast) {
                this._state.options.broadcast = Tools.formatIp(
                    Tools.broadcastFromIpCIDR(this._state.address, cidr));
            }

            this.emit('bound', this._state);

        } else {
            // We're sorry, today we have no IP for you...
        }
    }

    sendRelease(req: any) {

        //console.log('Send Release');

        // Formulate the response object
        const ans = {
            op: BOOTREQUEST,
            htype: 1, // RFC1700, hardware types: 1=Ethernet, 2=Experimental, 3=AX25, 4=ProNET Token Ring, 5=Chaos, 6=Tokenring, 7=Arcnet, 8=FDDI, 9=Lanstar (keep it constant)
            hlen: 6, // Mac addresses are 6 byte
            hops: 0,
            xid: this._state.xid++, // Selected by client on DHCPRELEASE
            secs: 0, // 0 or seconds since DHCP process started
            flags: 0,
            ciaddr: this.config('server'),
            yiaddr: INADDR_ANY,
            siaddr: INADDR_ANY,
            giaddr: INADDR_ANY,
            chaddr: this.config('mac'),
            sname: '', // unused
            file: '', // unused
            options: {
                53: DHCPRELEASE,
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
            op: BOOTREQUEST,
            htype: 1, // RFC1700, hardware types: 1=Ethernet, 2=Experimental, 3=AX25, 4=ProNET Token Ring, 5=Chaos, 6=Tokenring, 7=Arcnet, 8=FDDI, 9=Lanstar (keep it constant)
            hlen: 6, // Mac addresses are 6 byte
            hops: 0,
            xid: this._state.xid++, // Selected by client on DHCPRELEASE
            secs: 0, // 0 or seconds since DHCP process started
            flags: 0,
            ciaddr: this.config('server'),
            yiaddr: INADDR_ANY,
            siaddr: INADDR_ANY,
            giaddr: INADDR_ANY,
            chaddr: this.config('mac'),
            sname: '', // unused
            file: '', // unused
            options: {
                53: DHCPREQUEST,
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
            op: BOOTREQUEST,
            htype: 1, // RFC1700, hardware types: 1=Ethernet, 2=Experimental, 3=AX25, 4=ProNET Token Ring, 5=Chaos, 6=Tokenring, 7=Arcnet, 8=FDDI, 9=Lanstar (keep it constant)
            hlen: 6, // Mac addresses are 6 byte
            hops: 0,
            xid: this._state.xid++, // Selected by client on DHCPRELEASE
            secs: 0, // 0 or seconds since DHCP process started
            flags: 0,
            ciaddr: this.config('server'),
            yiaddr: INADDR_ANY,
            siaddr: INADDR_ANY,
            giaddr: INADDR_ANY,
            chaddr: this.config('mac'),
            sname: '', // unused
            file: '', // unused
            options: {
                53: DHCPREQUEST,
                50: this._state.address,
                // TODO: MAY clientID
                54: this._state.server // MUST server identifier
            }
        };

        this._state.state = 'REBINDING';
        this._state.tries = 0;

        // TODO: timeout

        // Send the actual data
        this._send(INADDR_BROADCAST, ans); // Send release directly to server
    }

    listen(port: any, host: any, fn: any) {

        this._sock.bind(port || CLIENT_PORT, host || INADDR_ANY, () => {
            this._sock.setBroadcast(true);
            if (fn instanceof Function) {
                process.nextTick(fn);
            }
        });
    }


    close(callback: any) {
        this._sock.close(callback);
    }

    _send(host: any, data: any) {

        const sb = Protocol.format(data);
    
        this._sock.send(sb._data, 0, sb._w, SERVER_PORT, host, (err: any, bytes: any) => {
          if (err) {
            console.log(err);
          } else {
            //console.log('Sent ', bytes, 'bytes');
          }
        });
      }
}