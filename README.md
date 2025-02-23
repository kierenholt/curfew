
# setup - one time only
    sudo apt install node-typescript
    sudo apt install npm
    sudo apt-get install nginx
    sudo apt install isc-dhcp-server
    sudo npm install pm2 -g

    cd ./app
    npm install

    cd ../server
    npm install

    sudo systemctl status isc-dhcp-server

## vscode extensions
1. useful for viewing db
    https://marketplace.visualstudio.com/items?itemName=qwtel.sqlite-viewer

## how to run LOCALLY INSIDE VS CODE (USES TEST DB AND REACT SANDBOX)
use debug button for backend and 
    cd app
    npm run start

## if you lose the wifi device this will reset back to default
sudo cd /etc/netplan/
sudo rm config.yaml
sudo netplan --debug generate
sudo netplan apply
reboot