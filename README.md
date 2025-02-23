
# setup
## services
10. install global packages
    sudo apt install node-typescript
    sudo apt install npm
1. install dhcp server
    sudo apt install isc-dhcp-server
    sudo systemctl status isc-dhcp-server
3. disable systemd-revolved
    open file:///etc/systemd/resolved.conf
    uncomment 
        #DNSStubListener=yes 
    and replace with 
        DNSStubListener=no
4. restart systemd-resolved
    sudo systemctl restart systemd-resolved
5. check port 53 is free (command should return nothing)
    sudo lsof -i:53

## vscode extensions
1. useful for viewing db
    https://marketplace.visualstudio.com/items?itemName=qwtel.sqlite-viewer

## certificate
3. generate certificate files
    cd certificate
    openssl req -nodes -new -x509 -keyout CA_key.pem -out CA_cert.pem -days 1825 -config CA.cnf
    openssl req -sha256 -nodes -newkey rsa:2048 -keyout localhost_key.pem -out localhost.csr -config localhost.cnf
    openssl x509 -req -days 398 -in localhost.csr -CA CA_cert.pem -CAkey CA_key.pem -CAcreateserial -out localhost_cert.pem -extensions req_ext -extfile localhost.cnf
    rm CA_cert.srl
    rm localhost.csr

## nginx
3. install nginx
    sudo apt-get install nginx
3. run ngnix
    sudo systemctl start nginx
4. also helpful
    sudo systemctl status nginx
    view logs in /var/log/nginx
4. check http://localhost shows nginx's welcome page
    
## frontend
1. get packages
    cd app
    npm install
2. build
    npm run build
4. copy build files to html directory
    cp -r ./build/* /var/www/html
5. change permissions
    sudo chmod -R 755 /var/www/
3. configure nginx
    complete the template in nginx/default 
    then copy the contents into file:///etc/nginx/sites-available/default
3. restart nginx
    sudo systemctl restart nginx
5. check that https://localhost now shows a blank page (dev tools will show 404 in network tab)

## backend
1. get packages
    cd server
    npm install
4. build
    node_modules/.bin/tsc -p tsconfig.json 
2. check bin folder has been created

## how to run LOCALLY OUTSIDE OF VS CODE (USES PRODUCTION DB)
    cd .. (project root)
    sudo TEST=1 node --inspect=2000 server/bin/run.js (only works outside of vscode)
3. also helpful
    sudo node --inspect=2000 server/bin/run.js
    sudo node server/bin/run.js

## how to run LOCALLY INSIDE VS CODE (USES TEST DB)
use debug button
