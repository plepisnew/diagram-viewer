#!/bin/bash
# This script builds the docker image, copies it directly to a host machine (without the need for container registries). The image is installed and run on the host machine
# Sample usage: `TAG=1.33.7 ./scripts/deploy.sh`

CACHE_STORE="/var/cache/diagram-viewer"
ENV_STORE="/etc/envconf/diagram-viewer"

IMAGE_NAME="diagram-viewer:$TAG"
IMAGE_CACHE="$CACHE_STORE/$TAG.tar"

ENV_SOURCE="./.env"
ENV_DEST="$ENV_STORE/.env"

HOST="root@165.22.21.43"

# Create docker image and serialize to tar

ssh $HOST "mkdir -p $CACHE_STORE $ENV_STORE"

docker build --no-cache -t $IMAGE_NAME -f Dockerfile .
docker save -o $IMAGE_CACHE $IMAGE_NAME
echo "Image $IMAGE_NAME persisted to $IMAGE_CACHE"

# Copy all necessary assets to the host machine with SSH
# Note: to run this command, you need to setup an SSH key with the host
scp $IMAGE_CACHE $HOST:$IMAGE_CACHE
scp $ENV_SOURCE $HOST:$ENV_DEST
echo "Assets copied $ENV_SOURCE:$ENV_DEST,$IMAGE_CACHE:$IMAGE_CACHE"

# Load image and run it in detached mode
ssh $HOST "docker load -i $IMAGE_CACHE && docker run --rm -d -p 5000:5000 --env-file $ENV_DEST $IMAGE_NAME"
echo "Image $IMAGE_NAME instantiated"

# Clean up
rm -rf $IMAGE_CACHE
ssh $HOST "rm -rf $IMAGE_CACHE"
echo "Cache assets cleaned up"