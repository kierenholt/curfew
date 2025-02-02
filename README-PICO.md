## soyflourbread, alpine linux image
https://github.com/soyflourbread/luckfox-pico?tab=readme-ov-file#flashing

## how to flash 
https://wiki.luckfox.com/Luckfox-Pico/Linux-MacOS-Burn-Image/

## how to ssh into luckfox


## linux version command
cat /etc/os-release



## network config
let it connect, to get the dns
then disable dhcp
no ip at start - must respond to curfew or have static ip?
login and set ip


# luckfox pico plus
SPI NAND FLASH 128MB
linux image is only 13MB

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
to check the leases
    nano /var/lib/dhcp/dhcpd.leases
    ssh root@<ip address>
password is luckfox

## SDK
https://wiki.luckfox.com/Luckfox-Pico/Luckfox-Pico-SDK#3-file-sharing

