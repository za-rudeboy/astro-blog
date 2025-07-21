---
title: "Azure OIDC and Github Actions"
description: "Using OIDC to authenticate from Github Actions to Azure"
date: "Jul 20 2025"
---

#### What is OpenID Connect (OIDC) and what are the benefits of using it? 

Let’s say you’re building a new deployment pipeline in GitHub Actions and want to provision or update infrastructure in Azure. The pipeline first needs a way to authenticate against your Microsoft Entra ID (formerly Azure AD) tenant and the target subscription.

The traditional pattern is to create a service principal (an application registration + service principal object) and generate a client secret (or sometimes a certificate). You then add this secret as a GitHub repository or organization secret for the workflow to consume.

There are two drawbacks to this *static client secret* approach:

1. The secret is long-lived (for example, six months) and you usually need to rotate it manually. In my experience with long-lived secrets, eventually you **will** forget to rotate one and it will expire at a very inconvenient time.
2. If the secret leaks, its long lifetime means a bad actor could potentially have access to your system for an extended period.

This is where OpenID Connect (OIDC) helps. In this scenario we use workload identity federation: GitHub issues an OIDC ID token identifying the workflow, and Microsoft Entra ID exchanges it for a short-lived access token.

By opting to use OIDC, you get “secretless” authentication for your GitHub Actions workflow against Azure. This means you no longer need to store any secrets; instead, you configure OIDC trust between GitHub and Azure. 

This is done adding a Federated Credential (a federated identity credential object) to the service principal / app registration in Entra ID. It specifies: issuer https://token.actions.githubusercontent.com, audience (usually api://AzureADTokenExchange), and subject filter (repo, branch, environment, tag, or pull request). That is the "trust"

When this is set up, instead of a static long-lived token you now have short-lived access tokens created for every workflow run. 

You also get more fine-grained authentication and authorization management. For example, You can restrict by repository, by branch/tag, by environment, and then assign least-privilege Azure RBAC roles to that service principal.

Below is a brief walk through of how to get this done. 
You will need Azure CLI, a GitHub repository and admin access to both an Azure subscription and GitHub repository.

#### Step 1: Get Your Azure Information

```bash
# Get your subscription ID
az account show --query id --output tsv

# Get your tenant ID
az account show --query tenantId --output tsv
```
Store these values one side - you will need them later.

#### Step 2: Create an App Registration

```bash
# Create the app registration
az ad app create --display-name "github-actions-hello-world"
```

Save the `appId` from the output - this is your `AZURE_CLIENT_ID`.

#### Step 3: Create Service Principal

```bash
# Create service principal (replace {app-id} with appId from step 2)
az ad sp create --id {app-id}
```

#### Step 4: Assign Azure Permissions

```bash
# Assign Contributor role to the service principal
az role assignment create \
  --assignee {app-id} \
  --role Contributor \
  --scope /subscriptions/{subscription-id}
```
Replace `{subscription-id}` with your subscription ID from Step 1.

#### Step 5: Create Federated Credential Configuration

Create a file called `federated-credential.json`:

```json
{
  "name": "github-actions-federated-credential",
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "repo:{github-username}/{repository-name}:ref:refs/heads/main",
  "description": "GitHub Actions federated credential",
  "audiences": [
    "api://AzureADTokenExchange"
  ]
}
```
Replace `{github-username}` and `{repository-name}` with your actual GitHub username and repository name.

#### Step 6: Create the Federated Credential

```bash
# Create the federated credential
az ad app federated-credential create \
  --id {app-id} \
  --parameters federated-credential.json
```

#### Step 7: Add GitHub Repository Secrets

In your GitHub repository, go to Settings → Secrets and variables → Actions, and add these secrets:

- `AZURE_CLIENT_ID`: The `appId` from Step 2
- `AZURE_TENANT_ID`: The tenant ID from Step 1  
- `AZURE_SUBSCRIPTION_ID`: The subscription ID from Step 1

#### Step 8: Test Authentication

Add this to your GitHub Actions workflow to test:

```yaml
- name: Azure Login
  uses: azure/login@v1
  with:
    client-id: ${{ secrets.AZURE_CLIENT_ID }}
    tenant-id: ${{ secrets.AZURE_TENANT_ID }}
    subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

- name: Test Azure CLI
  run: az account show
```

You will also need to add the `id-token: write` permission to your workflow. This tells GitHub Actions to allow the job to write ID tokens, which is required for OIDC authentication.

#### Troubleshooting

- Ensure the `subject` in federated-credential.json matches your repo and branch exactly
- Check that the service principal has Contributor role on the subscription
- For pull requests, you may need additional federated credentials with `pull_request` subject

