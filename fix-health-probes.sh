#!/bin/bash

# Script to configure health probes for Azure Container App
# Fixed version that uses proper Azure CLI parameters

RETRY_COUNT=5
RETRY_DELAY=30
APP_NAME="ascend-avoid"
RESOURCE_GROUP="DefaultResourceGroup-EUS"
IMAGE_NAME="portfoliodrewclarkazure.azurecr.io/ascend-avoid:a3c45463d40e28ac4f285ceec28e5516bcbd36af"

for i in $(seq 1 $RETRY_COUNT); do
  echo "Attempt $i to set health probes..."

  # Update container app with the image and health probe parameters directly
  az containerapp update \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --image $IMAGE_NAME \
    --probe-startup-http-get-path="/" \
    --probe-startup-http-get-port=3000 \
    --probe-startup-initial-delay=30 \
    --probe-startup-period=10 \
    --probe-startup-timeout=5 \
    --probe-startup-success-threshold=1 \
    --probe-startup-failure-threshold=30 && break
  
  if [ $i -eq $RETRY_COUNT ]; then
    echo "Failed to set health probes after $RETRY_COUNT attempts."
    exit 1
  fi

  echo "Operation in progress. Waiting $RETRY_DELAY seconds before retry..."
  sleep $RETRY_DELAY
done

echo "Health probes configured successfully!"
