#!/bin/bash
# Script to set up Azure credentials for GitHub Actions
# This script logs in to Azure, creates a service principal, and sets up GitHub secrets

# Ensure script exits on error
set -e

echo "=== Setting up Azure Credentials for GitHub Actions ==="

# Configuration variables
RESOURCE_GROUP="DefaultResourceGroup-EUS"
SERVICE_PRINCIPAL_NAME="GitHubActionsAscendAvoid"
REGISTRY_NAME="portfoliodrewclarkazure"
APP_NAME="ascend-avoid"
CREDENTIALS_FILE="azure_credentials.json"

# 1. Log in to Azure (if not already logged in)
echo "Checking Azure login status..."
az account show > /dev/null 2>&1 || {
    echo "Not logged in to Azure. Starting login process..."
    az login
}

# Get subscription ID
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
echo "Using subscription ID: $SUBSCRIPTION_ID"

# 2. Create a service principal with contributor access to the resource group
echo "Creating service principal $SERVICE_PRINCIPAL_NAME..."
az ad sp create-for-rbac \
    --name "$SERVICE_PRINCIPAL_NAME" \
    --role contributor \
    --scopes /subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP \
    --sdk-auth > $CREDENTIALS_FILE

echo "Service principal created and credentials saved to $CREDENTIALS_FILE"

# 3. Add ACR permissions
echo "Adding ACR push permissions..."
CLIENT_ID=$(cat $CREDENTIALS_FILE | grep -oP '(?<="clientId": ")[^"]*')
az role assignment create \
    --assignee "$CLIENT_ID" \
    --role AcrPush \
    --scope /subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.ContainerRegistry/registries/$REGISTRY_NAME

# 4. Set up GitHub secrets using GitHub CLI
echo "Checking GitHub CLI login status..."
gh auth status > /dev/null 2>&1 || {
    echo "Not logged in to GitHub. Starting login process..."
    gh auth login
}

echo "Setting up GitHub secret AZURE_CREDENTIALS..."
gh secret set AZURE_CREDENTIALS < $CREDENTIALS_FILE

# Extract individual credentials for separate secrets (optional)
CLIENT_SECRET=$(cat $CREDENTIALS_FILE | grep -oP '(?<="clientSecret": ")[^"]*')
TENANT_ID=$(cat $CREDENTIALS_FILE | grep -oP '(?<="tenantId": ")[^"]*')

echo "Setting up additional GitHub secrets..."
gh secret set ACR_USERNAME --body "$CLIENT_ID"
gh secret set ACR_PASSWORD --body "$CLIENT_SECRET"

echo "Cleaning up credentials file..."
rm $CREDENTIALS_FILE

echo "=== Setup complete ==="
echo "Azure credentials have been configured and stored in GitHub secrets."
echo "Your workflow should now be able to authenticate with Azure successfully."
