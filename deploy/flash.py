#!/usr/bin/python3

import os, sys, re, subprocess, json

path = "/home/kieren/Documents/typescript/luckfox-pico/IMAGE/IPC_SD_CARD_UBUNTU_RV1106_LUCKFOX_PICO_MAX_20250317.2119_RELEASE_TEST/IMAGES"
#path = "/home/kieren/Documents/typescript/luckfox-pico/output/image"

os.chdir(path)

#find using sudo blkid /dev/sd*
sd_device = '/dev/sdb'

def true_size(s):
   u = { 'B': 1, 'K': 1024, 'M': 1024*1024, 'G': 1024*1024*1024, '': 1 }
   if m := re.search('(\d+)([BKMG]?)',s):
      return int(m.group(1)) * u[m.group(2)]
   return 0

def writeSD(name, off):
   if os.path.exists(f"{name}.img"):
      cmd = ['dd',f"if={name}.img",f"of={sd_device}","bs=1k",f"seek={off//1024}"]
      try:
         res = subprocess.run(cmd,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,check=True)
      except subprocess.CalledProcessError as e:
         print(f"ERROR: {e}",e.stderr)
         sys.exit(-1)
   else:
      print()
      print(f"ERROR: '{name}.img' not found")
      sys.exit(-1)

def eraseFlash():
   cmd = ["upgrade_tool", "ef", "download.bin"]
   try:
      res = subprocess.run(cmd,check=True)
   except subprocess.CalledProcessError as e:
      print(f"ERROR: {e}",e.stderr)
      sys.exit(-1)

sdWrites = []

with open("env.img", "rb") as envFile:
   for line in envFile.read()[4:].decode("utf-8").split("\x00"):
      start = 0
      end = 0
      if m := re.search('(blkdevparts|sd_parts)=(\w+):(.*)',line):
         use_sd = m.group(1) == "blkdevparts"

         p = m.group(3).split(',')
         for e in p:
            #print(e)
            if (m := re.search('(\d+[KMG])@(\d+[KMG]?)\((\w+)\)',e)) or (m := re.search('(\d+[KMG])\((\w+)\)',e)):
               if len(m.groups())==3: #offset given
                  size = true_size(m.group(1))
                  start = true_size(m.group(2)) #offset
                  end = start + size
                  name = m.group(3)
               else: #no offset
                  size = true_size(m.group(1))
                  name = m.group(2)
                  start = end
                  end = start + size
            if use_sd: #sd
               sdWrites.append([name, start, size])

print(f"path: {path}")

if sys.argv[1] == 'read-env':
   print(f".reading offsets from env.img")
   for [name, offset, size] in sdWrites:
      print(f".{name} at {offset} with size {size}")

if sys.argv[1] == 'write-sd':
   print(".writing sd")
   for [name, offset] in sdWrites:
      print(f".writing {name} at {offset}")
      writeSD(name, offset)

if sys.argv[1] == 'erase-flash':
   print(".erasing flash")
   eraseFlash()
