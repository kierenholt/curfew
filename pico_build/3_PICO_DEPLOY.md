
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

# LOGIN VIA SSH TO INSTALL DEPENDENCIES
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

## TO INSTALL DEPENDENCIES ON PICO FOLLOW PICO_SETUP.MD

## SD -> IMAGE FILE
list devices to find sd card
    sudo blkid /dev/sd*
get offset and byte count of the rootfs volume
    cd deploy
    sudo python3 flash.py read-env
copy the rootfs to file (replace the skip and count arguments)
    sudo dd if=/dev/sdb of=/home/kieren/Documents/typescript/curfew-images/rootfs.img bs=64K skip=839680000 count=6442450944 iflag=skip_bytes,count_bytes conv=noerror,sync

## MOUNT DISK IMAGE FOR EDITING FILES
    cd /home/kieren/Documents/typescript/curfew-images
find unused loop device
    losetup -f
bind the device to the image
    sudo losetup /dev/loop14 rootfs.img
    sudo mount /dev/curfew /curfew-rootfs
image wil be mounted in /dev/curfew as a virtual directory

## BEFORE COPYING THE BIN FOLDER, MAKE SURE YOU HAVE READ BEFORE_DEPLOY.MD

## copy build files to mounted rootfs image

    cd server
    dest=/media/kieren/a5441bd8-8cf3-43f5-906c-d6fb2004a1a1/home/pico/curfew/server
    mkdir -p $dest/bin
    cp -r bin/* $dest/bin/
    mkdir -p $dest/node_modules
    cp -r node_modules/* $dest/node_modules/
    sync
    cd ..

# copy env
    cd pico_build
    dest=/media/kieren/a5441bd8-8cf3-43f5-906c-d6fb2004a1a1/home/pico/curfew/server
    cp .env $dest
    sync
    #chmod -R 755 $dest
    cd ..

# start as a service (first time)
    sudo pm2 start server/bin/run.js
    sudo pm2 save


# start (subsequent times)
    sudo pm2 start 0
    

# also helpful
#   pm2 stop 0
#   pm2 flush
#   pm2 logs 0


## ALSO USEFUL - UNMOUNT
    sudo umount /curfew-root
    sudo losetup -d /dev/curfew