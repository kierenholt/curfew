#!/bin/python

ETH_P_ALL = 0x0003
import socket
import sys

if __name__ == "__main__":
  interface = "wlp2s0"
  filename = "packet.dat"

#  with open(filename, 'r') as file:
#    hexlist = [int(x, 16) for x in file.read().split()]
  hexlist = [int(x, 16) for x in sys.argv[1].split()]

  packet = bytearray(hexlist)

  with socket.socket(socket.AF_PACKET, socket.SOCK_RAW) as rs:
    rs.bind((interface, ETH_P_ALL))
    sentbytes = rs.send(packet)

  #print("Sent packet of length %d bytes" % sentbytes)

  #run with python3 sender.py 