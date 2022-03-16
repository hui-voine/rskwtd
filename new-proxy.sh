#!/usr/bin/env bash

# How to start:
# 1. Sign up for DigitalOcean with this link https://www.digitalocean.com/?refcode=7bf219507e61
#    -- it will be filled with $10 to start out (if you use the above link)
# 2. Go to https://cloud.digitalocean.com/settings/applications and find you API key
# 3. In your shell, run 'export DIGITALOCEAN_TOKEN="INSERT TOKEN HERE"', without the outer quotes.
# 4. `brew install jq`
# 5. `./digitalocean-proxy`
# 6. When you are done, press CTRL+C ONCE, and everything will be cleaned up.

# Usage: digitalocean-proxy (on | off)
# Hitting ctrl-c while tunneled will exit the tunnel and turn the proxies off
# partial source: http://www.frankhq.io/blog/2012/11/14/how-to-setup-a-private-proxy-server-on-ec2-in-under-10-minutes/

STATE=$1

# Get a list of network services: networksetup -listallnetworkservices
NETWORKSERVICE=Wi-Fi

# Local port
PORT=3128

# Remote host
HOST=localhost

# Remote host port
HOST_PORT=8888

# Global:
# DIGITALOCEAN_TOKEN

# Location  of DigitalOcean API
DIGITALOCEAN_TOKEN="725b358b458b5275346117b61f7b4b145ca8fea08b196931dfefe7d1c9b971e7"
DIGITALOCEAN_API="https://api.digitalocean.com/v2"

# DigitalOcean ssh key id -- needs to correspond to your ssh key
SSH_KEY_ID="29100343"

# Starting/stopping the server
########################################################################

echo 'Insert your administrator/sudo password in the following prompt.'
sudo echo 'Sudo Up!'

node_up() {
    NAME="usa-proxy"
    
    echo 'Creating node'
    CREATE=$(curl -X POST \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $DIGITALOCEAN_TOKEN" \
        -d "{\"name\":\"proxy1\",\"region\":\"sfo3\",\"size\":\"s-1vcpu-1gb\",\"image\":\"ubuntu-20-04-x64\",\"ssh_keys\":[$SSH_KEY_ID],\"backups\":false,\"ipv6\":true,\"user_data\":null,\"private_networking\":null}" \
        --silent \
    "$DIGITALOCEAN_API/droplets")
    NODE_ID=$(echo $CREATE | jq -e -r ".droplet.id")
    echo "Node Id: $NODE_ID"
    
    echo "Wait for node's ip"
    while : ; do
        NODE_IP=$(curl -X GET \
            -H 'Content-Type: application/json' \
            -H "Authorization: Bearer $DIGITALOCEAN_TOKEN" \
            --silent \
            "$DIGITALOCEAN_API/droplets/$NODE_ID" | \
            jq -e -r ".droplet.networks.v4[0].ip_address"
        )
        # stop on success
        [ $? -eq 0 ] && echo "Node ip: $NODE_IP" && break
    done
    
    CONNECTION="-i $HOME/.ssh/id_rsa -o UserKnownHostsFile=/dev/null -o ConnectTimeout=2 -o StrictHostKeyChecking=no root@$NODE_IP"
    
    echo "Wait for node's ssh"
    until ssh -T $CONNECTION exit 2>/dev/null
    do
        echo -n '.'
        sleep 1
    done
    echo ''
    
    echo 'Provision node'
  ssh -T $CONNECTION <<CMDS
sudo apt-get update
sudo apt-get -y install tinyproxy
exit
CMDS
    echo 'Provisioning done'
}

node_down() {
    echo 'Node Down'
    
    curl -X DELETE \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $DIGITALOCEAN_TOKEN" \
    --silent \
    "$DIGITALOCEAN_API/droplets/$NODE_ID"
}

# Local proxy configuration
########################################################################

proxy_on() {
    echo 'Proxy On'
    sudo networksetup -setwebproxy $NETWORKSERVICE $HOST $PORT
    sudo networksetup -setsecurewebproxy $NETWORKSERVICE $HOST $PORT
    ssh -L $PORT:$HOST:$HOST_PORT -N $CONNECTION
}

proxy_off() {
    echo 'Proxy Off'
    sudo networksetup -setwebproxystate $NETWORKSERVICE off
    sudo networksetup -setsecurewebproxystate $NETWORKSERVICE off
}

control_c() {
    echo '* Exiting'
    node_down
    proxy_off
    exit $?
}

trap control_c INT

if [[ $STATE = 'on' || $STATE = '' ]]; then
    node_up
    proxy_on
    elif [[ $STATE = 'off' ]]; then
    proxy_off
    node_down
fi