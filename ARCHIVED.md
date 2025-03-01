# alpine rootfs image
https://wiki.luckfox.com/Luckfox-Pico/Luckfox-Pico-RV1103/Luckfox-Pico-Plus-Mini/Luckfox-Pico-Alpine-Linux-1/

## make custom linux kernel for cortex a7
https://developer.arm.com/documentation/den0013/d/Building-Linux-for-ARM-Systems/Building-the-Linux-kernel

## test kernel on qemu

## make custom alpine image using alpine sdk
https://wiki.alpinelinux.org/wiki/How_to_make_a_custom_ISO_image_with_mkimage#Create_the_ISO

## test image on qemu



## USING ROCKCHIP SDK (support custom alpine kernel)
add to path
    export PATH="/home/kieren/Documents/typescript/rkbin/tools:$PATH"


## USING LUCKFOX SDK (buildroot only, and > 128M)

## BOOT SPECIFICS - HOW IT LOADS
https://opensource.rock-chips.com/wiki_Boot_option
1. rom
2. idblock.img - preloader
3. uboot.img - boot loader. boots the kernel
4. boot.img - linux kernel
5. rootfs.img - linux FILESYSTEM (what needs replacing from docker)

## different kernel? ROCKCHIP KERNEL REPO
git clone https://github.com/rockchip-linux/kernel.git