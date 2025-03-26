
## install projects

    git clone https://github.com/kierenholt/curfew.git
    cd curfew 

    cd app
    npm install
    cd ..

    cd server
    npm install
    cd ..


## compile

    cd app
    npm run build 
    cd ..

    cd server
    node_modules/.bin/tsc 
    cd ..


## generate certificate files

    cd pico_build
    openssl req -nodes -new -x509 -keyout CA_key.pem -out CA_cert.pem -days 1825 -config CA.cnf
    openssl req -sha256 -nodes -newkey rsa:2048 -keyout localhost_key.pem -out localhost.csr -config localhost.cnf
    openssl x509 -req -days 398 -in localhost.csr -CA CA_cert.pem -CAkey CA_key.pem -CAcreateserial -out localhost_cert.pem -extensions req_ext -extfile localhost.cnf
    rm CA_cert.srl
    rm localhost.csr
    cd ..

## copy certificate files to server/bin folder

    cd pico_build
    mkdir -p ../server/bin/cert
    cp localhost_cert.pem ../server/bin/cert
    cp localhost_key.pem ../server/bin/cert
    cd ..

## env settings

create .env file in the server folder with contents below

# .env

```
HTTP_PORT=80
HTTPS_PORT=443
MOCK_ROUTER=0
DNS_ENABLED=1
DNS_PORT=53
HOSTNAME=curfew
BYPASS_ALL=0
WIFI=
WIFI_SSID=
WIFI_PASSWORD=
DEFAULT_THIS_HOST=91
DEFAULT_DHCP_MIN_HOST=100
DEFAULT_DHCP_MAX_HOST=200
DEFAULT_DNS_SERVER=1.1.1.1
USE_REACT_DEV_SERVER=0
```


