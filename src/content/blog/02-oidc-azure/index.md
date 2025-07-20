---
title: "Azure OIDC and Github Actions"
description: "Using OIDC to authenticate from Github Actions to Azure"
date: "Jul 20 2025"
---

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





