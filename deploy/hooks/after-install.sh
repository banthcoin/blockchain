#!/bin/bash

# install git
sudo yum install git -y

# install node 14.x
curl -sL https://rpm.nodesource.com/setup_14.x | sudo bash -
sudo yum install nodejs -y

# install yarn
npm install yarn -g

# install pm2
yarn global add pm2

# configure pm2
pm2 startup