
## this is for dev setup, for SoC/production setup, see PICO.md
# setup - one time only
    follow these steps https://nodejs.org/en/download
# this copies local version of node into /usr/local 
    n=$(which node);n=${n%/bin/node}; chmod -R 755 $n/bin/*; sudo cp -r $n/{bin,lib,share} /usr/local
    sudo apt install -yes isc-dhcp-server
    sudo npm install -yes pm2 -g

    git clone https://github.com/kierenholt/curfew.git

    cd ./app
    npm install

    cd ../server
    npm install

    sudo systemctl status isc-dhcp-server

# check node is installed
    sudo node -v

# env settings
create .env file in the appropriate folders (see below)
copy contents into each file

## how to configure netplan
use
    ip link show
to get the name of the target network card e.g enp1s0, wlp2s0

## option 1 wifi 
copy wifi-static to /etc/netplan
then edit to include correct device name, network ssid and password. 
    cd deploy
    cp -f wifi-static.yaml /etc/netplan/config.yaml
    sudo nano /etc/netplan/config.yaml
then apply new settings
    netplan --debug apply

## option 2 ethernet
copy eth-static to /etc/netplan
then edit to include correct device name. 
    cd deploy
    cp -f eth-static.yaml /etc/netplan/config.yaml
    sudo nano /etc/netplan/config.yaml
then apply new settings
    netplan --debug apply

## vscode extensions
1. useful for viewing db
    https://marketplace.visualstudio.com/items?itemName=qwtel.sqlite-viewer

## how to run LOCALLY INSIDE VS CODE
use attach button for backend and 
    cd ../app
    npm run start
    cd ../server
    sudo node --inspect-brk bin/run.js

## if you lose the wifi device this will reset back to network manager (and disable netplan)
cd /etc/netplan/
sudo rm config.yaml
sudo netplan --debug generate
sudo netplan apply
reboot

## how to turn off the service
enable dhcp server on the router
    sudo pm2 list
    sudo pm2 stop 0

## how to turn it back on
disable dhcp server on the router
    sudo pm2 list
    sudo pm2 start 0

# TEST ENV - /server/.env
HTTP_PORT=5000
HTTPS_PORT=5001
ROUTER_ENABLED=1
DNS_ENABLED=1
DNS_PORT=5353
HOSTNAME=curfew
BYPASS_ALL=0
WIFI=
WIFI_SSID=
WIFI_PASSWORD=
DEFAULT_THIS_HOST=39
DEFAULT_DHCP_MIN_HOST=100
DEFAULT_DHCP_MAX_HOST=200
DEFAULT_DNS_SERVER=1.1.1.1

# PRODUCTION ENV - /deploy/.env
HTTP_PORT=80
HTTPS_PORT=443
ROUTER_ENABLED=1
DNS_ENABLED=1
DNS_PORT=53
HOSTNAME=curfew
BYPASS_ALL=0
WIFI=
WIFI_SSID=
WIFI_PASSWORD=
DEFAULT_THIS_HOST=39
DEFAULT_DHCP_MIN_HOST=100
DEFAULT_DHCP_MAX_HOST=200
DEFAULT_DNS_SERVER=1.1.1.1
