npm init
## how to run
### server
sudo node --inspect=2000 server/bin/run.js

### app
app/npm run start

## to do
block for X minutes - needs to show time limit, add timelimit table? add button to cancel timelimit limit,  add job to check for time limit then remove it and disable / enable
list recent requests
initialisation status setting and class which controls initialisation
try different router ips if router not found 
add whether requests were cached
change TTL to 300 or auto

# tests
tests-  dhcp does actually enable, ip is blocked, port is blocked
7711

## low priority
disable inactivity timer when the progress modal is showing
the pageContent params are a mess
disables upnp (if port not blockable)

# bug
