# PowerShell script to set up Azure credentials for GitHub Actions
# This script logs in to Azure, creates a service principal, and sets up GitHub secrets

param (
    [string]$ResourceGroup = "DefaultResourceGroup-EUS",
    [string]$ServicePrincipalName = "GitHubActionsAscendAvoid",
    [string]$RegistryName = "portfoliodrewclarkazure",
    [string]$AppName = "ascend-avoid",
    [string]$CredentialsFile = "azure_credentials.json"
)

$ErrorActionPreference = "Stop"

Write-Output "=== Setting up Azure Credentials for GitHub Actions ==="

# 1. Log in to Azure (if not already logged in)
Write-Output "Checking Azure login status..."
try {
    $azAccount = az account show
    if ($LASTEXITCODE -ne 0) {
        throw "Not logged in"
    }
} catch {
    Write-Output "Not logged in to Azure. Starting login process..."
    az login
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to login to Azure. Please try again."
        exit 1
    }
}

# Get subscription ID
$subscriptionId = (az account show --query id -o tsv)
Write-Output "Using subscription ID: $subscriptionId"

# 2. Create a service principal with contributor access to the resource group
Write-Output "Creating service principal $ServicePrincipalName..."
az ad sp create-for-rbac `
    --name "$ServicePrincipalName" `
    --role contributor `
    --scopes "/subscriptions/$subscriptionId/resourceGroups/$ResourceGroup" `
    --sdk-auth | Out-File -FilePath $CredentialsFile -Encoding utf8
    
Write-Output "Service principal created and credentials saved to $CredentialsFile"

# 3. Add ACR permissions
Write-Output "Adding ACR push permissions..."
$rawJson = Get-Content -Path $CredentialsFile -Raw
$credentials = $rawJson | ConvertFrom-Json
$clientId = $credentials.clientId

az role assignment create `
    --assignee "$clientId" `
    --role AcrPush `
    --scope "/subscriptions/$subscriptionId/resourceGroups/$ResourceGroup/providers/Microsoft.ContainerRegistry/registries/$RegistryName"

# 4. Set up GitHub secrets using GitHub CLI
Write-Output "Checking GitHub CLI login status..."
try {
    gh auth status
    if ($LASTEXITCODE -ne 0) {
        throw "Not logged in"
    }
} catch {
    Write-Output "Not logged in to GitHub. Starting login process..."
    gh auth login
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to login to GitHub. Please try again."
        exit 1
    }
}

Write-Output "Setting up GitHub secret AZURE_CREDENTIALS..."
Get-Content -Path $CredentialsFile | gh secret set AZURE_CREDENTIALS

# Extract individual credentials for separate secrets (optional)
$clientSecret = $credentials.clientSecret
$tenantId = $credentials.tenantId

Write-Output "Setting up additional GitHub secrets..."
gh secret set ACR_USERNAME --body $clientId
gh secret set ACR_PASSWORD --body $clientSecret

Write-Output "Cleaning up credentials file..."
Remove-Item -Path $CredentialsFile -Force

Write-Output "=== Setup complete ==="
Write-Output "Azure credentials have been configured and stored in GitHub secrets."
Write-Output "Your workflow should now be able to authenticate with Azure successfully."
