[ `whoami` = root ] || { sudo "$0" "$@"; exit $?; }

# disable systemd-resolved to free up port 53
    systemctl stop systemd-resolved
    cp -f resolved.conf /etc/systemd/resolved.conf
    systemctl start systemd-resolved
# check port 53 is free (command should return nothing)
    lsof -i:53

# generate certificate files
    openssl req -nodes -new -x509 -keyout CA_key.pem -out CA_cert.pem -days 1825 -config CA.cnf
    openssl req -sha256 -nodes -newkey rsa:2048 -keyout localhost_key.pem -out localhost.csr -config localhost.cnf
    openssl x509 -req -days 398 -in localhost.csr -CA CA_cert.pem -CAkey CA_key.pem -CAcreateserial -out localhost_cert.pem -extensions req_ext -extfile localhost.cnf
    rm CA_cert.srl
    rm localhost.csr

# copy certificate files
    mkdir -p /etc/nginx/ssl
    cp localhost_cert.pem /etc/nginx/ssl
    cp localhost_key.pem /etc/nginx/ssl

# configure nginx
    systemctl stop nginx
    cp -f default /etc/nginx/sites-available/default
    systemctl start nginx

# configure pm2 to run on startup 
    pm2 startup

# also helpful
#    sudo systemctl status nginx
#    view logs in /var/log/nginx
#    sudo systemctl restart nginx

# deploy
    ./deploy_next.sh

# start as a service
    cd /opt/curfew
    pm2 start bin/run.js
    pm2 save

# also helpful
#   pm2 stop 0
#   pm2 flush
#   pm2 logs 0
