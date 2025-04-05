## SSH BACK IN 

## start run.js as a service (first time)
    cd curfew/server
    sudo pm2 start bin/run.js #no need to include 'node' command
    sudo pm2 save
    sudo pm2 startup

## start (subsequent times)
    sudo pm2 start 0
    

# also helpful
#   pm2 stop 0
#   pm2 flush
#   pm2 logs 0

# helpful - copy externally built app folder to locally built bin folder

clone git then build server locally
    rm -rf curfew-server-build
    git clone https://github.com/kierenholt/curfew.git curfew-server-build
    cd curfew-server-build/server
    npm install
    node_modules/.bin/tsc
    cd ../..

copy builds
    cp -r curfew-server-build/server/bin curfew/server/bin
    cp -r curfew-app-build/server/bin/cert curfew/server/bin/cert
    cp -r curfew-app-build/server/bin/app curfew/server/bin/app
    cp curfew-app-build/server/.env curfew/server/.env
    
run it
    cd curfew/server
    sudo node bin/run.js
    #sudo chmod 0600 /etc/netplan/00-installer-config.yaml