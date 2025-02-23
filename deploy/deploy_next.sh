[ `whoami` = root ] || { sudo "$0" "$@"; exit $?; }

## frontend
# build
    cd ../app
    npm run build

# copy build files to html directory
    cp -r ./build/* /var/www/html

# change permissions
    chmod -R 755 /var/www/

##backend
# build
    cd ../server
    node_modules/.bin/tsc -p tsconfig.json 

# copy build files over
    mkdir -p /opt/curfew/bin
    cp -r bin/* /opt/curfew/bin/
    mkdir -p /opt/curfew/node_modules
    cp -r node_modules/* /opt/curfew/node_modules/

# copy env
    cd ../deploy
    cp .env /opt/curfew
    chmod -R 755 /opt/curfew
