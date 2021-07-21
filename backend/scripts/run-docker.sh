#!/bin/bash

echo '[Tsubaki] Checking for migrations...'
typeorm migration:run

echo '[Tsubaki] Migrations has been ran, now running...'
yarn start
