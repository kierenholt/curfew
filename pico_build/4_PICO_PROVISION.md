## SSH BACK IN 

## start run.js as a service (first time)
    cd curfew/server
    sudo pm2 start server/bin/run.js
    sudo pm2 save

## start (subsequent times)
    sudo pm2 start 0
    

# also helpful
#   pm2 stop 0
#   pm2 flush
#   pm2 logs 0
