npm init

## forwarder repo
https://github.com/AkshayViru/dns-forwarder/tree/main

## dhcp repo
https://github.com/infusion/node-dhcp/tree/master

## arp concepts 
https://www.spiceworks.com/tech/networking/articles/what-is-arp/

## arp repo
https://www.npmjs.com/package/arpjs

## fingerbank 
https://api.fingerbank.org/api_doc/2/combinations/interrogate.html

## how to disable curren dhcp
sudo systemctl stop isc-dhcp-server.service
sudo systemctl start isc-dhcp-server.service


# TODO 
add detail to group list, user list etc.
booking list shows detail i.e. start to end time
add setup guide pages

add shortcut to change name that used once and changes their name

get curfew to show up for dns in firefox etc.

device needs to show most recent request

match more than one domain component using dot

maintenance to cleanup cached promises etc.

option to view deleted users / groups / devices in lists

id requests to devices apple / android / chromebook 
https://support.apple.com/en-us/101555
ntp.ubuntu.com

option to hide common domains

get new domains from past 24 hours

# TODO MUCH LATER
use bonjour to detect devices
when add user to reason for ban (if user is banned)
allow manual dhcp entries
instant update the request list

# how to run - dev
API_PORT=5000
DNS_PORT=53
DHCP_ENABLED=0
DHCP_MOCKED=1
DNS_ENABLED=0
TEST_SOCKET=0
API_ENABLED=1

DANGEROUSLY_DISABLE_HOST_CHECK=true
PORT=3000


# how to run - production
API_PORT=80
DNS_PORT=53
DHCP_ENABLED=1
DHCP_MOCKED=0
DNS_ENABLED=1
TEST_SOCKET=0
API_ENABLED=1

DANGEROUSLY_DISABLE_HOST_CHECK=true
PORT=80
sudo node --inspect=2000 server/bin/run.js

