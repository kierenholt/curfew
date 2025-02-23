[ `whoami` = root ] || { sudo "$0" "$@"; exit $?; }

## frontend
# build
# copy build files to html directory
    cd ../app
    npm run build
    cp -r ./build/* /var/www/html
    cd -

# change permissions to www
    chmod -R 755 /var/www/

##backend
# build
# copy build files over
    cd ../server
    node_modules/.bin/tsc -p tsconfig.json 

    mkdir -p /opt/curfew/bin
    cp -r bin/* /opt/curfew/bin/
    mkdir -p /opt/curfew/node_modules
    cp -r node_modules/* /opt/curfew/node_modules/
    cd -

# copy env
    cd ../deploy
    cp .env /opt/curfew
    chmod -R 755 /opt/curfew
    cd -
