
# TO DO 
## tests
 serves the correct dns server address 
 can be updated

 
## new features
app test suite for router - offline and online
https://stackoverflow.com/questions/8817500/how-to-make-sure-that-a-certain-port-is-not-occupied-by-any-other-process
when you change the host setting, it should restart
after finish setup, count down then refresh the page, saying default password is 0000 
make progress a non static class
use only mui/material or only mui/joy but not both
flashing LED indicates whether setup has found an ip - then go to that ip?
add a router test that actually tests the ip filter and port filter e..g ping a google ip
router auto select is too fragile - get user to pick their router
password method should not throw if password is incorrect
5577

## hardware check
check if pico can restart
check if 192.168.1.1 also works (community fibre)
clone pico to sd
list recent requests
add whether requests were cached
change TTL to 300 or auto
POST check - check dependencies etc.

## low priority
disable inactivity timer when the progress modal is showing
the pageContent params are a mess
disables upnp (if port not blockable)

## ideas
any keywords get reported to clients dns as 192.168.x.x - a second ethernet interface
the interface listens raw i.e. all ports
forwards all packets when keyword not blocked. only reads the port / ip, does basic NAT
drops all packets when keywords is blocked. does not need to read the packets
