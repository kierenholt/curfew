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
    git clone https://github.com/kierenholt/curfew.git

    cd curfew/server
    npm install
    node_modules/.bin/tsc
    cd ../..

    cp -r curfew-external-build/server/bin/app curfew/server/bin/app
    cp curfew-external-build/server/.env curfew/server/.env
    cp -r curfew-external-build/server/bin/cert curfew/server/bin/cert
    
    cd curfew/server
    sudo node bin/run.js
    #sudo chmod 0600 /etc/netplan/00-installer-config.yaml