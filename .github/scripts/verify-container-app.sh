#!/bin/bash
set -e

# Check if the container app exists
echo "Checking if container app 'ascend' exists in resource group 'DefaultResourceGroup-EUS'..."
APP_EXISTS=$(az containerapp show --name ascend --resource-group DefaultResourceGroup-EUS --query "name" --output tsv 2>/dev/null || echo "notfound")

if [ "$APP_EXISTS" == "notfound" ]; then
    echo "Container app 'ascend' not found. Creating it now..."
    # Check if the managed environment exists
    ENV_EXISTS=$(az containerapp env show --name managedEnvironment-DefaultResource-90bb --resource-group DefaultResourceGroup-EUS --query "name" --output tsv 2>/dev/null || echo "notfound")
    
    if [ "$ENV_EXISTS" == "notfound" ]; then
        echo "Container Apps environment not found. Creating it first..."
        az containerapp env create \
            --name managedEnvironment-DefaultResource-90bb \
            --resource-group DefaultResourceGroup-EUS \
            --location eastus
    fi
    
    # Create the container app
    az containerapp create \
        --name ascend \
        --resource-group DefaultResourceGroup-EUS \
        --environment managedEnvironment-DefaultResource-90bb \
        --image docker.io/aiandrew631/ascend-avoid:latest \
        --target-port 3000 \
        --ingress external
    
    echo "Container app 'ascend' created successfully."
else
    echo "Container app 'ascend' already exists."
fi
