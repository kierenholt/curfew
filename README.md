npm init
## how to run
### server
sudo node --inspect=2000 server/bin/run.js

### app
app/npm run start

## to do
"block all" / "allow all" buttons
block for X minutes - needs to show time limit, add endsOn to keyword table? add button to cancel time limit,  add job to check for time limit then remove it and disable / enable
list recent requests
tests-  dhcp does actually enable, ip is blocked, port is blocked
initialisation status setting and class which controls initialisation
keyword detail shows number of and lists matching domains
try different router ips if router not found 
block chatgpt
disables upnp (if port not blockable)

## refactor
disable inactivity timer when the progress modal is showing
the pageContent params are a mess