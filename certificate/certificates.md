## how to make certificate for local ips
https://stackoverflow.com/questions/66558788/how-to-create-a-self-signed-or-signed-by-own-ca-ssl-certificate-for-ip-address

## uk example values
https://www.lancaster.ac.uk/iss/tsg/cosign/csr-windows.html

## how to run https from express
https://stackoverflow.com/questions/11744975/enabling-https-on-express-js

## commands

openssl req -nodes -new -x509 -keyout CA_key.pem -out CA_cert.pem -days 1825 -config CA.cnf
openssl req -sha256 -nodes -newkey rsa:2048 -keyout localhost_key.pem -out localhost.csr -config localhost.cnf
openssl x509 -req -days 398 -in localhost.csr -CA CA_cert.pem -CAkey CA_key.pem -CAcreateserial -out localhost_cert.pem -extensions req_ext -extfile localhost.cnf
rm CA_cert.srl
rm localhost.csr


## files that may be deleted

CA_cert.srl
localhost.csr

## to keep
CA_cert.pem - must be added to the browser local authority storage
CA_key.pem - Must be used when creating new [localhost] certificate.

## to instal at webserver
localhost_cert.pem → SSL certificate. Must be installed at WEB server.
localhost_key.pem → Secret key. Must be installed at WEB server.