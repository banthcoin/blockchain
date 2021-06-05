#!/bin/bash

# application directory
cd /home/ec2-user/node

# set production environment
export ENV_PATH="/home/ec2-user/.env.production"

# run all tests
node -r @adonisjs/assembler/build/register japaFile.ts