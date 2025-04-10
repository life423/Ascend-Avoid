# Deployment Configuration Guide

## GitHub Actions Workflow

The GitHub Actions workflow has been configured to automatically deploy the application to Azure Container Apps. The workflow is triggered on pushes to the `main` branch or can be manually triggered.

## Required Secrets

The following secrets need to be configured in GitHub repository settings under "Settings" > "Secrets and variables" > "Actions":

### Azure Authentication
- `ASCEND_AZURE_CLIENT_ID`: Azure client ID for authentication
- `ASCEND_AZURE_TENANT_ID`: Azure tenant ID
- `ASCEND_AZURE_SUBSCRIPTION_ID`: Azure subscription ID

### Docker Hub Authentication
- `ASCEND_REGISTRY_USERNAME`: Docker Hub username
- `ASCEND_REGISTRY_PASSWORD`: Docker Hub password or access token

## Azure Resources

The workflow depends on the following Azure resources:
- Resource Group: `DefaultResourceGroup-EUS`
- Container Apps Environment: `managedEnvironment-DefaultResource-90bb`
- Container App: `ascend`

## Verification Script

A verification script has been added to check if the container app exists and create it if necessary. This addresses the "resource not found" error that was occurring in the workflow.

## Docker Hub Integration

The Docker Hub login has been fixed to use the correct format. This addresses the "error logging into Docker Hub" issue.

## Running the Workflow

The workflow can be manually triggered from the GitHub Actions tab:
1. Go to the repository's "Actions" tab
2. Select the "Trigger auto deployment for ascend" workflow
3. Click "Run workflow" and select the branch to run it from (usually `main`)

## Troubleshooting

If the workflow fails:

1. Check if the Azure credentials are correctly configured
2. Verify that the Docker Hub credentials are valid and have permission to push to the repository
3. Examine the workflow logs for any specific error messages
