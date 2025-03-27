
# TO DO 
## tests
 serves the correct dns server address 
 can be updated

 
## new features
test suite for router - offline and online
check port 53 avaialbilty on startup sudo netstat -anp
when you change the host setting, it should restart 
after finish setup, count down then refresh the page, saying default password is 0000 
click "new timer". shows like google timer, with "on complete, change to:" - then shows the same switches. add timelimit table? add button to delete the timelimit,  adds cron job? to check for time limit then remove it and disable / enable


## hardware check
check if pico can restart
check if 192.168.1.1 also works (community fibre)
clone pico to sd
list recent requests
add whether requests were cached
change TTL to 300 or auto
block ... now / in 5 mins ... for ... 5 mins / 60 mins / forever OK etc. with dropdowns
POST check - check dependencies etc.


# tests
tests-  dhcp does actually enable, ip is blocked, port is blocked

## low priority
disable inactivity timer when the progress modal is showing
the pageContent params are a mess
disables upnp (if port not blockable)
