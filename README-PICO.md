## chip
https://wiki.luckfox.com/Luckfox-Pico/Download
SPI NAND FLASH 128MB
pico plus - Rockchip RV1103 (ARM Cortex-A7 ARMv7-A architecture)

## about the chip
http://file.whycan.com/files/members/9058/Rockchip%20RV1103%20Datasheet%20V1.1-20220427.pdf

## rootfs images ubuntu etc.
https://drive.google.com/drive/folders/1sFUWjYpDDisf92q9EwP1Ia7lHgp9PaFS

# alpine rootfs image
https://wiki.luckfox.com/Luckfox-Pico/Luckfox-Pico-RV1103/Luckfox-Pico-Plus-Mini/Luckfox-Pico-Alpine-Linux-1/

## make custom linux kernel for cortex a7
https://developer.arm.com/documentation/den0013/d/Building-Linux-for-ARM-Systems/Building-the-Linux-kernel

## test kernel on qemu

## make custom alpine image using alpine sdk
https://wiki.alpinelinux.org/wiki/How_to_make_a_custom_ISO_image_with_mkimage#Create_the_ISO

## test image on qemu


## linux version command
cat /etc/os-release

## USING ROCKCHIP SDK (support custom alpine kernel)
add to path
    export PATH="/home/kieren/Documents/typescript/rkbin/tools:$PATH"


## USING LUCKFOX SDK (buildroot only, and > 128M)

# how to get upgrade tool
https://wiki.luckfox.com/Luckfox-Pico/Linux-MacOS-Burn-Image/
https://wiki.luckfox.com/Luckfox-Pico/Luckfox-Pico-RV1103/Luckfox-Pico-Plus-Mini/Linux-MacOS-Burn-Image

# HOW TO FLASH
hold button while connecting USB cable
run lsusb to check it has connected - should say "Fuzhou Rockchip Electronics Company"
it should NOT say "Fuzhou Rockchip Electronics Company rk3xxx" - this is system mode not burn mode
download the image
unzip it
cd into the unzipped folder
run 
    sudo upgrade_tool uf update.img 
connect pico plus to network
to check the leases:
vendor-class-identifier = "udhcp 1.36.1";
    sudo service isc-dhcp-server status 
OR
    nano /var/lib/dhcp/dhcpd.leases
    ssh root@<ip address>
password is luckfox




## BOOT SPECIFICS - HOW IT LOADS
https://opensource.rock-chips.com/wiki_Boot_option
1. rom
2. idblock.img - preloader
3. uboot.img - boot loader. boots the kernel
4. boot.img - linux kernel
5. rootfs.img - linux FILESYSTEM (what needs replacing from docker)

## different kernel? ROCKCHIP KERNEL REPO
git clone https://github.com/rockchip-linux/kernel.git