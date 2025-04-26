# PowerShell script to configure health probes for Azure Container App

param (
    [int]$RetryCount = 5,
    [int]$RetryDelay = 30,
    [string]$AppName = "ascend-avoid",
    [string]$ResourceGroup = "DefaultResourceGroup-EUS",
    [string]$ImageName = "portfoliodrewclarkazure.azurecr.io/ascend-avoid:a3c45463d40e28ac4f285ceec28e5516bcbd36af"
)

$ErrorActionPreference = "Stop"

Write-Output "========== Configuring Health Probes: $AppName =========="

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

    for ($i = 1; $i -le $RetryCount; $i++) {
        Write-Output "Attempt $i to set health probes..."

        # Update container app with health probe parameters directly
        az containerapp update `
            --name $AppName `
            --resource-group $ResourceGroup `
            --image $ImageName `
            --probe-startup-http-get-path="/" `
            --probe-startup-http-get-port=3000 `
            --probe-startup-initial-delay=30 `
            --probe-startup-period=10 `
            --probe-startup-timeout=5 `
            --probe-startup-success-threshold=1 `
            --probe-startup-failure-threshold=30
        
        if ($LASTEXITCODE -eq 0) {
            Write-Output "Health probes configured successfully!"
            break
        }
        
        if ($i -eq $RetryCount) {
            Write-Error "Failed to set health probes after $RetryCount attempts."
            exit 1
        }
        
        Write-Output "Operation in progress. Waiting $RetryDelay seconds before retry..."
        Start-Sleep -Seconds $RetryDelay
    }
    
    Write-Output "========== Configuration Complete =========="
} catch {
    Write-Error "Configuration failed: $_"
    exit 1
}
