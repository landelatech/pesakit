---
title: M-Pesa Node
description: Typed Node.js SDK and documentation for Safaricom M-Pesa Daraja APIs.
template: splash
hero:
  title: Typed Daraja flows for Node.js teams
  tagline: Build STK Push, C2B, B2C, account balance, transaction status, reversal, and callback handling with one focused TypeScript SDK.
  actions:
    - text: Quick start
      link: /getting-started/quick-start/
      variant: primary
    - text: API coverage
      link: /reference/api-coverage/
      variant: secondary
    - text: GitHub
      link: https://github.com/landelatech/mpesa-node
      variant: minimal
sidebar:
  hidden: true
---

## What this package is for

- Build against Safaricom Daraja from a Node.js runtime without carrying your own auth, request, and callback plumbing.
- Keep credential handling explicit: constructor values override environment variables, and missing config fails fast.
- Stay close to Daraja wire formats while still getting ergonomic method names and typed request/response contracts.

## What you get

- `Mpesa` as a single entry point for the implemented API families.
- Automatic OAuth token fetching with in-memory caching and concurrent refresh deduplication.
- Typed SDK errors for auth, request, validation, and callback parsing failures.
- Optional callback parsers and a standalone HTTP callback handler for STK, C2B, and async result routes.
- A docs set that covers local testing, sandbox credentials, go-live preparation, and common troubleshooting.

## Start here

1. Read the [quick start](/getting-started/quick-start/).
2. Configure your [environment and credentials](/getting-started/configuration/).
3. Confirm the [Node runtime expectations](/getting-started/node-runtime/).
4. Pick the guide for your first flow: [STK Push](/guides/stk-push/), [C2B](/guides/c2b/), or [B2C](/guides/b2c/).

## Operational docs

- Need sandbox credentials? Use the [sandbox setup guide](/operations/sandbox-credentials/).
- Preparing for production? Follow the [go-live checklist](/operations/go-live/).
- Tracking failures? Start with the [error reference](/reference/errors/) and [troubleshooting guide](/reference/troubleshooting/).

## Scope note

This SDK focuses on the commonly used Daraja payment and operational APIs. The current implementation surface and known gaps are tracked in the [API coverage matrix](/reference/api-coverage/).
