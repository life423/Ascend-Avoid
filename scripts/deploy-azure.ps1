# Azure Manual Deployment Script
# This script deploys the application to Azure Container Apps

param (
    [string]$ImageTag = $env:IMAGE_TAG,
    [switch]$SkipBuild = $false
)

# Set default tag if not provided
if (-not $ImageTag) {
    $ImageTag = "latest"
}

$ErrorActionPreference = "Stop"
$ACR_NAME = "portfoliodrewclarkazure"
$IMAGE_NAME = "ascend-avoid"
$RESOURCE_GROUP = "DefaultResourceGroup-EUS"
$CONTAINER_APP_NAME = "ascend-avoid"

Write-Output "========== Azure Deployment: $IMAGE_NAME-$ImageTag =========="

try {
    # Check for Azure CLI
    $azCliVersion = az --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Azure CLI is not installed. Please install it from https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
        exit 1
    }
    
    # Check login status
    $loginStatus = az account show 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Output "Not logged in to Azure. Initiating login..."
        az login
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to log in to Azure."
            exit 1
        }
    } else {
        $accountInfo = $loginStatus | ConvertFrom-Json
        Write-Output "Using Azure account: $($accountInfo.name)"
    }

    # Build and push image if SkipBuild is not specified
    if (-not $SkipBuild) {
        # Build the application
        Write-Output "Building the application..."
        npm run build
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to build the application."
            exit 1
        }
        
        # Build Docker image
        Write-Output "Building Docker image: $IMAGE_NAME:$ImageTag"
        docker build -t "$IMAGE_NAME:$ImageTag" .
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to build Docker image."
            exit 1
        }
        
        # Tag for ACR
        Write-Output "Tagging image for ACR: $ACR_NAME.azurecr.io/$IMAGE_NAME:$ImageTag"
        docker tag "$IMAGE_NAME:$ImageTag" "$ACR_NAME.azurecr.io/$IMAGE_NAME:$ImageTag"
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to tag Docker image."
            exit 1
        }
        
        # Login to ACR
        Write-Output "Logging in to ACR: $ACR_NAME"
        az acr login --name $ACR_NAME
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to log in to ACR."
            exit 1
        }
        
        # Push to ACR
        Write-Output "Pushing image to ACR: $ACR_NAME.azurecr.io/$IMAGE_NAME:$ImageTag"
        docker push "$ACR_NAME.azurecr.io/$IMAGE_NAME:$ImageTag"
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to push Docker image to ACR."
            exit 1
        }
    } else {
        Write-Output "Skipping build and push. Using existing image: $ACR_NAME.azurecr.io/$IMAGE_NAME:$ImageTag"
    }
    
    # Deploy to Azure Container App
    Write-Output "Deploying to Azure Container App: $CONTAINER_APP_NAME"
    az containerapp update `
        --name $CONTAINER_APP_NAME `
        --resource-group $RESOURCE_GROUP `
        --image "$ACR_NAME.azurecr.io/$IMAGE_NAME:$ImageTag"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to deploy to Azure Container App."
        exit 1
    }
    
    Write-Output "Deployment completed successfully!"
    Write-Output "Verifying deployment..."
    
    # Verify deployment
    npm run verify-deployment:azure
    
    Write-Output "========== Deployment Complete =========="
} catch {
    Write-Error "Deployment failed: $_"
    exit 1
}
