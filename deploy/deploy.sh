
## compile to js (if you need to run outside of vscode)

    cd app
    npm run build #should add files to /server/bin/app
    cd ..

    cd server
    node_modules/.bin/tsc #should add files to /server/bin
    cd ..

# copy build files to mounted rootfs image

    cd server
    dest=/media/kieren/a5441bd8-8cf3-43f5-906c-d6fb2004a1a1/home/pico/curfew/server
    mkdir -p $dest/bin
    cp -r bin/* $dest/bin/
    mkdir -p $dest/node_modules
    cp -r node_modules/* $dest/node_modules/
    cd -

# copy env
    cd deploy
    cp .env /opt/curfew
    chmod -R 755 /opt/curfew
    cd -

# start
    sudo pm2 start 0
    
# start as a service
    sudo pm2 start server/bin/run.js
    sudo pm2 save



# also helpful
#   pm2 stop 0
#   pm2 flush
#   pm2 logs 0