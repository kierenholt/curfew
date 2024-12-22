## isc dhcp server

https://ubuntu.com/server/docs/how-to-install-and-configure-isc-dhcp-server

## update dhcp settings
nano /etc/dhcp/dhcpd.conf

 option domain-name-servers 192.168.1.1, 192.168.1.2; //current ip
 option domain-name "mydomain.example";

## status
sudo systemctl status isc-dhcp-server.service

 ## tests
 serves the correct dns server address 
 can be updated

## how to disable curren dhcp
sudo systemctl stop isc-dhcp-server.service
sudo systemctl start isc-dhcp-server.service

## other systemctl commands
https://github.com/VolantisDev/node-systemctl/blob/master/index.js

## npm package
https://github.com/adonespitogo/node-isc-dhcp-server/blob/master/src/service.js
https://www.npmjs.com/package/isc-dhcp-server


