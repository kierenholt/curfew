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
find out why outlook does not work
delete keyword filter
create keyword filter
change ip address on setting change 
make random ip address on first time boot?
try different router ips if router not found 