
# install upgrade tool
sudo unzip upgrade_tool_v2.17.zip
cd upgrade_tool_v2.17_for_linux/
sudo cp upgrade_tool /usr/local/bin
sudo chmod +x /usr/local/bin/upgrade_tool


# how to use upgrade_tool
https://github.com/vicharak-in/Linux_Upgrade_Tool


## MAKING IMAGES
https://wiki.luckfox.com/Luckfox-Pico/Luckfox-Pico-SDK/

    cd "/home/kieren/Documents/typescript/luckfox-pico"
    ./build.sh lunch


choose custom
then option 15
15. BoardConfig_IPC/BoardConfig-SD_CARD-Ubuntu-RV1103_Luckfox_Pico_Plus-IPC.mk
                             boot medium(启动介质): SD_CARD
                          system version(系统版本): Ubuntu
                        hardware version(硬件版本): RV1103_Luckfox_Pico_Plus
                             application(应用场景): IPC
----------------------------------------------------------------
    sudo ./build.sh

# IMAGE FILE -> SD
hold button while connecting USB cable
run lsusb to check it has connected - should say "Fuzhou Rockchip Electronics Company"
it should NOT say "Fuzhou Rockchip Electronics Company rk3xxx" - this is system mode not 

list devices to find sd card
    sudo blkid /dev/sd*
make sure device and path are correct in flash.py
run flash.py

# SD -> IMAGE FILE
list devices to find sd card
    sudo blkid /dev/sd*
clone sd to file
    sudo dd if=/dev/sdb1 of=/home/kieren/Documents/typescript/curfew-images/rootfs.img bs=64K conv=noerror,sync

## LOGIN VIA SSH
connect pico plus to network
to check the leases:
client-hostname "luckfox";
mac ea:7b:5c:56:bb:b1
    sudo service isc-dhcp-server status 
OR
    nano /var/lib/dhcp/dhcpd.leases
    ssh pico@192.168.0.118
password is luckfox
linux version command
    cat /etc/os-release
    uname -a

## MOUNT DISK IMAGE FOR EDITING FILES
    cd /home/kieren/Documents/typescript/curfew-images
    sudo losetup /dev/curfew rootfs.img
    sudo mount /dev/curfew /curfew-root


## COPY FILES

## THEN SYNC

## UPDATE NPM ON THE PICO
% sudo apt update  # Update package list
% sudo apt upgrade # Upgrade installed packages
% sudo apt install -y ca-certificates curl gnupg
% sudo mkdir -p /etc/apt/keyrings
% curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
% echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
% sudo apt update
% sudo apt install nodejs -y
    node -v # Should print "v22.14.0".
    npm -v # Should print "10.9.2".
    sync

## UNOUNT DEVICE (NOT REALLY NECESSARY)
    sudo umount /curfew-root
    sudo losetup -d /dev/curfew