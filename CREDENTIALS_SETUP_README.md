# Azure Credentials Setup for GitHub Actions

This repository contains two scripts to help you set up Azure credentials for GitHub Actions. These scripts simplify the process of creating a service principal in Azure and storing the credentials in your GitHub repository as secrets.

## Available Scripts

1. **setup-azure-credentials.sh** - Bash script for Linux/macOS users
2. **Setup-AzureCredentials.ps1** - PowerShell script for Windows users

## Prerequisites

Before running these scripts, ensure you have the following installed:

- **Azure CLI** - For interacting with Azure ([Installation Guide](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli))
- **GitHub CLI** - For managing GitHub repository secrets ([Installation Guide](https://cli.github.com/manual/installation))

## How to Run the Scripts

### On Windows

```powershell
# Run the PowerShell script directly
.\Setup-AzureCredentials.ps1

# If you want to customize parameters
.\Setup-AzureCredentials.ps1 `
    -ResourceGroup "YourResourceGroup" `
    -ServicePrincipalName "YourServicePrincipalName" `
    -RegistryName "YourRegistryName" `
    -AppName "YourAppName"
```

### On Linux/macOS

```bash
# Make the script executable
chmod +x setup-azure-credentials.sh

# Run the script
./setup-azure-credentials.sh
```

## What These Scripts Do

1. **Login to Azure** - Prompts for login if not already logged in
2. **Create a Service Principal** - Creates an Azure service principal with Contributor rights to your resource group
3. **Add ACR Permissions** - Grants AcrPush role to the service principal for your Azure Container Registry
4. **Configure GitHub Secrets** - Uses GitHub CLI to store credentials as repository secrets
5. **Clean Up** - Removes the temporary credentials file from your computer

## Resulting GitHub Secrets

The scripts will add the following secrets to your GitHub repository:

- `AZURE_CREDENTIALS` - Complete Azure service principal credentials in JSON format
- `ACR_USERNAME` - Client ID for Azure Container Registry authentication
- `ACR_PASSWORD` - Client secret for Azure Container Registry authentication

## Manual Setup Alternative

If you prefer to set up credentials manually:

1. Run this Azure CLI command:
   ```bash
   az ad sp create-for-rbac --name "GitHubActionsAscendAvoid" \
     --role contributor \
     --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/DefaultResourceGroup-EUS \
     --sdk-auth
   ```

2. Copy the JSON output and add it as a GitHub secret named `AZURE_CREDENTIALS`.

## Troubleshooting

- **Azure Login Issues**: Ensure you have the proper Azure subscription permissions
- **GitHub Authentication Issues**: Run `gh auth login` manually if the script fails to authenticate
- **Permission Errors**: Verify you have admin access to the GitHub repository for setting secrets

## Additional Resources

- [Azure Container Apps Documentation](https://docs.microsoft.com/en-us/azure/container-apps/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Azure GitHub Actions](https://github.com/Azure/actions)
