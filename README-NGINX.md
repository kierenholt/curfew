test settings 
api listens on port 5000
nginx routes api requests on 80 to port 5000
nginx serves react static pages on 80

## https://gist.github.com/soheilhy/8b94347ff8336d971ad0

## to start (in terminal)
sudo nginx

## to see status
impossible - it just needs to be running in terminal

## to reload 
nginx -s reload

## to end
nginx -s stop

## to edit settings
sudo nano /etc/nginx/sites-available/default (or open in vscode)

