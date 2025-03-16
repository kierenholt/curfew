
## this is for dev setup, for SoC/production setup, see PICO.md
# setup - one time only
    follow these steps https://nodejs.org/en/download
# this copies local version of node into /usr/local 
    n=$(which node);n=${n%/bin/node}; chmod -R 755 $n/bin/*; sudo cp -r $n/{bin,lib,share} /usr/local
    sudo node -v #should show same version as node -v

    sudo apt install -yes isc-dhcp-server
    sudo npm install -yes pm2 -g

    git clone https://github.com/kierenholt/curfew.git

    cd app
    npm install
    cd ..

    cd server
    npm install
    cd ..

    sudo systemctl status isc-dhcp-server


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


# disable systemd-resolved dns listener to free up port 53
    cd deploy
    systemctl stop systemd-resolved
    cp -f resolved.conf /etc/systemd/resolved.conf
    systemctl start systemd-resolved

# check port 53 is free (command should return nothing)
    lsof -i:53

# generate certificate files
    openssl req -nodes -new -x509 -keyout CA_key.pem -out CA_cert.pem -days 1825 -config CA.cnf
    openssl req -sha256 -nodes -newkey rsa:2048 -keyout localhost_key.pem -out localhost.csr -config localhost.cnf
    openssl x509 -req -days 398 -in localhost.csr -CA CA_cert.pem -CAkey CA_key.pem -CAcreateserial -out localhost_cert.pem -extensions req_ext -extfile localhost.cnf
    rm CA_cert.srl
    rm localhost.csr

# copy certificate files
    mkdir -p ../server/bin/cert
    cp localhost_cert.pem ../server/bin/cert
    cp localhost_key.pem ../server/bin/cert

## vscode extensions
1. useful for viewing db
    https://marketplace.visualstudio.com/items?itemName=qwtel.sqlite-viewer

## how to run LOCALLY INSIDE VS CODE
use attach button for backend and 
    cd ../app
    npm run start
    cd ../server
    node_modules/.bin/tsc --watch
    sudo node --inspect-brk bin/run.js
    f5
    visit http://localhost:3000/


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
USE_REACT_DEV_SERVER=1

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
USE_REACT_DEV_SERVER=0
