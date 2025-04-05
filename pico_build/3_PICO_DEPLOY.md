# HOW TO COPY BIN FOLDER TO SD CARD (PICO ROOT FILESYSTEM)

## MAKE IMAGE FILE FROM SD CARD ROOTFS PARTITION
list devices to find sd card
    sudo lshw -C disk
get offset and byte count of the rootfs volume
    cd deploy
    sudo python3 flash.py read-env
copy the sd rootfs partition to file (replace the skip and count arguments)
    sudo dd if=/dev/sdb of=/home/kieren/Documents/typescript/curfew-images/rootfs.img bs=64K skip=839680000 count=6442450944 iflag=skip_bytes,count_bytes conv=noerror,sync

## MOUNT DISK IMAGE FOR EDITING FILES
find unused loop device
    losetup -f
or unmount previous
bind the device to the image
    loopName=/dev/loop14
    sudo umount $loopName
    sudo losetup -d $loopName
    sudo losetup $loopName /home/kieren/Documents/typescript/curfew-images/rootfs.img
image wil be mounted in /dev/curfew as a virtual directory

## copy build files to mounted rootfs image

    dest=/media/kieren/a5441bd8-8cf3-43f5-906c-d6fb2004a1a1/home/pico/curfew-app-build/server
    rm -rf $dest
    mkdir $dest
    cp -rf server/* $dest/
    sync
 
# copy env
    cd server
    dest=/media/kieren/a5441bd8-8cf3-43f5-906c-d6fb2004a1a1/home/pico/curfew-app-build
    cp .env $dest
    sync
    cd ..

## NOW RE-RUN FLASH.PY TO COPY UPDATED ROOTFS TO SD

list devices to find sd card
    sudo lshw -C disk
make sure device and path are correct in flash.py
run flash.py
    cd pico_build
    sudo python3 flash.py write-rootfs
    cd ..

## ALSO USEFUL - UNMOUNT
    sudo umount /curfew-root
    sudo losetup -d /dev/loop14

## helpful - how to turn pm2 back on

    sudo pm2 list
    sudo pm2 start 0
