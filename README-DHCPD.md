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