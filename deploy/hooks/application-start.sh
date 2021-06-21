#!/bin/bash

# set production environment
export ENV_PATH="/home/ec2-user/.env.production"

# application directory
cd /home/ec2-user/node

# install dependencies
yarn install

# build
node ace build --production

# run migrations
node ace migration:run --force

# run migrations
node ace db:seed

# start application
pm2 start build/server.js

# save application in pm2
pm2 save