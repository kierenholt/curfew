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

# env settings

create .env file in the appropriate folders (see below)
copy contents into each file

# disable systemd-resolved dns listener to free up port 53 

    https://www.qualityology.com/tech/ubuntu-port-53-already-in-use-how-to-free-the-dns-port/
    sudo nano /etc/systemd/resolved.conf
edit so that DNSStubListener=no 
    sudo ln -sf /run/systemd/resolve/resolv.conf /etc/resolv.conf

# check port 53 is free (command should return nothing)

    lsof -i:53

# generate certificate files

    cd deploy/ #the file certificates are in this folder
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

## how to run LOCALLY INSIDE VS CODE, USING REACT DEV SERVER

use attach button for backend and 
    cd ../app
    npm run start
    cd ../server
    node_modules/.bin/tsc --watch
    sudo node --inspect-brk bin/run.js
    f5
    visit http://localhost:3000/

## to reset back to network manager

    sudo nano /etc/netplan/config.yaml
change netpland to NetworkManager
    sudo netplan apply

## how to turn off the service (in case the process ends abruptly and cannot turn them off)

    sudo systemctl stop isc-dhcp-server
    sudo pm2 list
    sudo pm2 stop 0
NB: also enable dhcp server on the router

## how to turn it back on

    sudo pm2 list
    sudo pm2 start 0

# TEST ENV - /server/.env

```
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
```

# PRODUCTION ENV - /deploy/.env

```
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
```
