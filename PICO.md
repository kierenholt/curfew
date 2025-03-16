
# install upgrade tool
cd deploy
cd upgrade_tool_v2.17
sudo cp upgrade_tool /usr/local/bin
sudo chmod +x /usr/local/bin/upgrade_tool

# check it is installed
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

# IMAGE FILE -> SD
hold button while connecting USB cable
run lsusb to check it has connected - should say "Fuzhou Rockchip Electronics Company"
it should NOT say "Fuzhou Rockchip Electronics Company rk3xxx" - this is system mode not 

list devices to find sd card
    lshw -C disk
    sudo blkid /dev/sd*
make sure device and path are correct in flash.py
run flash.py
    cd deploy
    sudo python3 flash.py
    cd ..

# SD -> IMAGE FILE
list devices to find sd card
    sudo blkid /dev/sd*
clone sd to file
    sudo dd if=/dev/sdb1 of=/home/kieren/Documents/typescript/curfew-images/rootfs.img bs=64K conv=noerror,sync

# CHECK PICO HAS BEEN FLASHED
    plug in with no sd card
    run sudo upgrade_tool LD
    it should list the pico as mode=MaskRom
download boot ?
?    sudo upgrade_tool DB download.bin

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



# how to use upgrade_tool
https://github.com/vicharak-in/Linux_Upgrade_Tool