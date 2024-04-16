const bns = require('bns');
const {RecursiveServer} = bns;

const server = new RecursiveServer({
  tcp: true,
  inet6: true,
  edns: true,
  dnssec: true
});

// Root Hints (see lib/hints.js):
server.hints.setDefault();

// Custom hints:
// server.hints.fromFile('/path/to/our/custom.hints');

server.on('query', (req, res, rinfo) => {
  // Log all requests (dig format).
  console.log('Incoming request:');
  //console.log(res);
  //console.log(req.toString());
  //res.code(3); //not found dns code https://support.umbrella.com/hc/en-us/articles/232254248-Guide-to-common-Domain-Name-System-DNS-Return-Codes-RCodes
});

server.bind(5300, '127.0.0.1');
// server.bind(5300, '192.168.0.78'); socket already bound error

// nslookup -port=5300 www.google.com 127.0.0.1
