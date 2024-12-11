npm init
## how to run
### server
sudo node --inspect=2000 server/bin/run.js
### app
app/npm run start

## how to disable curren dhcp
sudo systemctl stop isc-dhcp-server.service
sudo systemctl start isc-dhcp-server.service


# how to run - dev
API_PORT=5000
DNS_PORT=53
DNS_ENABLED=0
API_ENABLED=1

DANGEROUSLY_DISABLE_HOST_CHECK=true
PORT=3000


# how to run - production
API_PORT=80
DNS_PORT=53
DNS_ENABLED=1
API_ENABLED=1

# react env
DANGEROUSLY_DISABLE_HOST_CHECK=true
PORT=80

## to do
test that dhcp is turned off when needed
test that dns responses are saved
test that correct filters are written to router on update 
progress indicator when adding removing filter it takes a few mins