#!/bin/bash

# set production environment
export ENV_PATH="/home/ec2-user/.env.production"

# application directory
cd /home/ec2-user/node

# run tests
yarn test