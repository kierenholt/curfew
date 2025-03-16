[ `whoami` = root ] || { sudo "$0" "$@"; exit $?; }

cd "$(dirname "$0")"

# configure pm2 to run on startup 
    pm2 startup

# deploy app and server code
    ./deploy_next.sh

# start as a service
    pm2 start /opt/curfew/bin/run.js
    pm2 save

# also helpful
#   pm2 stop 0
#   pm2 flush
#   pm2 logs 0

# copy production db to local dir - for inspection?
    cp /opt/curfew/curfew.db ./