---
title: PesaKit
description: PesaKit is the Node.js SDK and implementation guide for Safaricom M-Pesa Daraja APIs.
template: splash
hero:
  title: PesaKit for M-Pesa on Node.js
  tagline: Built by Landela Tech for practical STK Push, Dynamic QR, C2B, B2C, pull-based reconciliation, status checks, reversals, and callback-heavy Daraja integrations.
  actions:
    - text: Quick start
      link: /getting-started/quick-start/
      variant: primary
    - text: Explore flows
      link: /guides/stk-push/
      variant: secondary
    - text: GitHub
      link: https://github.com/landelatech/mpesa-node
      variant: minimal
sidebar:
  hidden: true
---

PesaKit is built and maintained by [Landela Tech](https://landelatech.com/), a payments-focused engineering team shipping production integrations across local and international providers.

## Why teams use this SDK

- Build against Safaricom Daraja from a Node.js backend without carrying your own auth, request-shaping, and callback-parsing plumbing.
- Keep integrations explicit and maintainable with typed inputs, typed responses, and fast-fail validation at the SDK boundary.
- Move faster across common M-Pesa payment and operational flows with one consistent `Mpesa` client from PesaKit.

## What you get out of the box

- `Mpesa` as a single entry point for the implemented API families.
- Automatic OAuth token fetching with in-memory caching and concurrent refresh deduplication.
- Typed SDK errors for auth, request, validation, and callback parsing failures.
- Optional callback parsers and a standalone HTTP callback handler for STK, C2B, and async result routes.
- Pull-based reconciliation support for recent C2B transaction recovery.
- A docs set that covers setup, local testing, sandbox credentials, go-live preparation, and common troubleshooting.

## Built for practical Node.js integrations

- Use it in Node services, Express or Fastify apps, workers, queue consumers, or other backend processes that need to talk to Daraja.
- Keep credential sourcing flexible with constructor config and environment-variable fallback.
- Stay close to Daraja behavior while avoiding repetitive payload assembly across flows.

## Start here

1. Read the [quick start](/getting-started/quick-start/).
2. Configure your [environment and credentials](/getting-started/configuration/).
3. Confirm the [Node runtime expectations](/getting-started/node-runtime/).
4. Follow the [end-to-end STK payment flow](/guides/end-to-end-stk/) if you are integrating your first checkout. 5. Pick the guide for your first flow: [STK Push](/guides/stk-push/), [Dynamic QR](/guides/dynamic-qr/), [C2B](/guides/c2b/), [Pull Transactions](/guides/pull-transactions/), or [B2C](/guides/b2c/).

## Choose your path

- Taking customer payments from a phone prompt: start with [STK Push and Query](/guides/stk-push/) and then read the [end-to-end STK payment flow](/guides/end-to-end-stk/).
- Generating a scan-to-pay QR for in-person or assisted checkout: use [Dynamic QR](/guides/dynamic-qr/).
- Receiving direct customer payments into your business shortcode: use [C2B Register URLs and Simulation](/guides/c2b/).
- Reconciling missing or delayed C2B callbacks: use [Pull Transactions](/guides/pull-transactions/).
- Sending money out to customers: use [B2C Payments](/guides/b2c/).
- Building callback receivers and recovery jobs: use [Callbacks and Local Testing](/guides/callbacks/) and [Callback Reliability and Reconciliation](/operations/callback-reliability/).

## Why this package stays focused

This SDK is aimed at the M-Pesa flows most Node teams need in normal product and operations work. Daraja APIs that mainly serve special onboarding programs, commercial agreements, or narrower enterprise workflows are tracked in the [API coverage matrix](/reference/api-coverage/) but intentionally kept out of the core SDK surface.

## Operational docs

- Need sandbox credentials? Use the [sandbox setup guide](/operations/sandbox-credentials/).
- Designing resilient callback handling? Read [callback reliability and reconciliation](/operations/callback-reliability/).
- Preparing for production? Follow the [go-live checklist](/operations/go-live/).
- Tracking failures? Start with the [error reference](/reference/errors/), [result and status reference](/reference/result-codes/), and [troubleshooting guide](/reference/troubleshooting/).

## Scope note

This SDK focuses on the commonly used Daraja payment and operational APIs. The current implementation surface and known gaps are tracked in the [API coverage matrix](/reference/api-coverage/).

## About Landela Tech

Landela Tech specializes in production payment integrations, helping teams ship real-world flows across local and international providers without reinventing the operational plumbing.

Learn more at [landelatech.com](https://landelatech.com/).
