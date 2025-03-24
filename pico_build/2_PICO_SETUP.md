# HOW TO CREATE DISK IMAGE AND THEN COPY FS TO SD

## install upgrade tool
cd deploy
cd upgrade_tool_v2.17
sudo cp upgrade_tool /usr/local/bin
sudo chmod +x /usr/local/bin/upgrade_tool

## check it is installed
upgrade_tool

## MAKING IMAGES
https://wiki.luckfox.com/Luckfox-Pico/Luckfox-Pico-SDK/

    cd "/home/kieren/Documents/typescript/luckfox-pico"
    ./build.sh lunch


choose custom
then option 21
21. BoardConfig_IPC/BoardConfig-SD_CARD-Ubuntu-RV1106_Luckfox_Pico_Max-IPC.mk
                             boot medium(启动介质): SD_CARD
                          system version(系统版本): Ubuntu
                        hardware version(硬件版本): RV1106_Luckfox_Pico_Max
                             application(应用场景): IPC
----------------------------------------------------------------

    sudo ./build.sh

## IMAGE FILE -> SD
hold button while connecting USB cable
run lsusb to check it has connected - should say "Fuzhou Rockchip Electronics Company"
it should NOT say "Fuzhou Rockchip Electronics Company rk3xxx" - this is system mode not 

list devices to find sd card
    lshw -C disk
    sudo blkid /dev/sd*
make sure device and path are correct in flash.py
run flash.py
    cd deploy
    sudo python3 flash.py write-sd
    cd ..

## ERASE PICO'S SPI-NAND SO IT BOOTS FROM SD
    sudo python3 flash.py erase-flash
plug in with no sd card
run sudo upgrade_tool LD
it should list the pico as mode=MaskRom

# LOGIN VIA SSH
connect pico plus to network
to check the leases:
client-hostname "luckfox";
mac ea:7b:5c:56:bb:b1
    sudo service isc-dhcp-server status 
OR
    nano /var/lib/dhcp/dhcpd.leases
    ssh pico@192.168.0.45
password is luckfox
linux version command
    cat /etc/os-release
    uname -a

## node setup

    follow these steps https://nodejs.org/en/download

## if sudo node does not work - this copies local version of node into /usr/local

    n=$(which node);n=${n%/bin/node}; chmod -R 755 $n/bin/*; sudo cp -r $n/{bin,lib,share} /usr/local
    sudo node -v #should show same version as node -v

## other packages

    sudo apt update
    sudo apt install -y isc-dhcp-server ca-certificates curl gnupg
    sudo npm install -y pm2 -g

## check port 53 is free (command should return nothing)

    lsof -i:53

## if port 53 is used, then disable systemd-resolved dns listener

    https://www.qualityology.com/tech/ubuntu-port-53-already-in-use-how-to-free-the-dns-port/
    sudo nano /etc/systemd/resolved.conf
edit so that DNSStubListener=no 
    sudo ln -sf /run/systemd/resolve/resolv.conf /etc/resolv.conf
