
## this is for dev setup, for SoC/production setup, see PICO.md
# setup - one time only
    sudo apt install nodejs
    sudo apt install isc-dhcp-server
    sudo npm install pm2 -g

    git clone https://github.com/kierenholt/curfew.git

    cd ./app
    npm install

    cd ../server
    npm install

    sudo systemctl status isc-dhcp-server

## how to configure netplan
use
    ip link show
to get the name of the target network card e.g enp1s0, wlp2s0

## option 1 wifi 
copy 00-wifi to /etc/netplan
then edit to include correct device name, network ssid and password. 
    cd deploy
    cp -f wifi.yaml /etc/netplan/config.yaml
    sudo nano /etc/netplan/config.yaml
then apply new settings
    netplan --debug apply

## option 2 ethernet
copy 00-eth to /etc/netplan
then edit to include correct device name. 
    cd deploy
    cp -f eth.yaml /etc/netplan/config.yaml
    sudo nano /etc/netplan/config.yaml
then apply new settings
    netplan --debug apply

## vscode extensions
1. useful for viewing db
    https://marketplace.visualstudio.com/items?itemName=qwtel.sqlite-viewer

## how to run LOCALLY INSIDE VS CODE (USES TEST DB AND REACT SANDBOX)
use debug button for backend and 
    cd app
    npm run start

## if you lose the wifi device this will reset back to network manager (and disable netplan)
cd /etc/netplan/
sudo rm config.yaml
sudo netplan --debug generate
sudo netplan apply
reboot

## how to turn off the service
sudo pm2 list
sudo pm2 stop 0
sudo systemctl stop isc-dhcp-server