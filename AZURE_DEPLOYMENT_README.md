# Azure Deployment Configuration for Health Probes

## Issue Description

The original deployment script was attempting to update the Azure Container App with health probes using a method that isn't compatible with the current Azure CLI:

```bash
# Original approach that caused the error
az containerapp update \
  --name ascend-avoid \
  --resource-group DefaultResourceGroup-EUS \
  --file updated_config.json
```

**Error Message:**
```
ERROR: unrecognized arguments: --file updated_config.json
```

The `--file` parameter is not recognized by the `az containerapp update` command. Instead, the health probe settings need to be configured using specific parameters directly in the command.

## Solution

Three alternative scripts have been provided to fix this issue:

### 1. Bash Script (`fix-health-probes.sh`)

A Bash script that uses the proper Azure CLI parameters to configure health probes. This script:
- Retries the operation up to 5 times
- Uses a 30-second delay between attempts
- Configures the startup probe parameters directly

### 2. PowerShell Script (`scripts/set-health-probes.ps1`)

A PowerShell script that:
- Verifies Azure CLI is installed
- Checks for Azure login status
- Uses the proper parameters for configuring health probes
- Implements the same retry mechanism

### 3. Updated GitHub Action Workflow (`updated-azure-deploy.yml`)

An updated version of your GitHub Actions workflow that:
- Separates the container app update and health probe configuration into two steps
- Uses the correct parameters for health probe configuration

## How to Use

### Local Execution

**Bash:**
```bash
chmod +x fix-health-probes.sh
./fix-health-probes.sh
```

**PowerShell:**
```powershell
pwsh -File scripts/set-health-probes.ps1
```

### GitHub Actions

To use the updated GitHub Action workflow, replace the content of `.github/workflows/azure-deploy.yml` with the content from `updated-azure-deploy.yml`.

## Health Probe Configuration

The configured health probe settings are:

| Setting | Value |
|---------|-------|
| Type | Startup |
| Path | / |
| Port | 3000 |
| Initial Delay | 30 seconds |
| Period | 10 seconds |
| Timeout | 5 seconds |
| Success Threshold | 1 |
| Failure Threshold | 30 |

These settings can be customized by modifying the parameters in the respective scripts.
