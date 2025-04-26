# Azure Login Setup for GitHub Actions

This document explains how to properly set up the Azure credentials for GitHub Actions to ensure successful authentication with Azure.

## Issue with Azure Login

If you encounter the following error with the Azure login step in your GitHub Actions workflow:

```
Error: Login failed with Error: Using auth-type: SERVICE_PRINCIPAL. Not all values are present. Ensure 'client-id' and 'tenant-id' are supplied. Double check if the 'auth-type' is correct.
```

This means that the `AZURE_CREDENTIALS` secret in your GitHub repository is not properly configured or doesn't contain all the necessary values.

## Proper Setup for Azure Credentials

The `azure/login@v1` action expects the `creds` parameter to be a JSON object containing all the required service principal information.

### 1. Create a Service Principal

First, create an Azure Service Principal that GitHub Actions can use:

```bash
az ad sp create-for-rbac --name "GitHubActionsAscendAvoid" --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/{resource-group} \
  --sdk-auth
```

Replace `{subscription-id}` with your Azure subscription ID and `{resource-group}` with your resource group name (e.g., `DefaultResourceGroup-EUS`).

This command will output a JSON object that looks like this:

```json
{
  "clientId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "clientSecret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "subscriptionId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
```

### 2. Create GitHub Secret

1. Go to your GitHub repository
2. Click on "Settings" > "Secrets and variables" > "Actions"
3. Click "New repository secret"
4. Name: `AZURE_CREDENTIALS`
5. Value: Paste the entire JSON output from the previous step
6. Click "Add secret"

### 3. Verify the Workflow Configuration

Ensure that your workflow YAML file uses the secret correctly:

```yaml
- name: Login to Azure
  uses: azure/login@v1
  with:
    creds: ${{ secrets.AZURE_CREDENTIALS }}
```

### 4. Additional ACR Permissions (If Needed)

If you're working with Azure Container Registry, ensure your service principal has the proper permissions:

```bash
az role assignment create \
  --assignee {clientId} \
  --role AcrPush \
  --scope /subscriptions/{subscriptionId}/resourceGroups/{resourceGroup}/providers/Microsoft.ContainerRegistry/registries/{registryName}
```

Replace:
- `{clientId}` with your service principal's client ID
- `{subscriptionId}` with your subscription ID
- `{resourceGroup}` with your resource group
- `{registryName}` with your Azure Container Registry name (e.g., `portfoliodrewclarkazure`)

## Troubleshooting

If issues persist:

1. Check that the service principal still exists in Azure AD
2. Ensure that the service principal has the necessary permissions
3. Verify that the secret hasn't expired (service principals can have an expiry date)
4. Regenerate the service principal if necessary and update the GitHub secret
5. Check that your resource group and container registry names match exactly as they appear in Azure
