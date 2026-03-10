---
title: Go Live Checklist
description: Prepare your integration for production rollout with the SDK and the Daraja portal.
sidebar:
  order: 2
---

## Before you request production access

- Confirm every callback URL is public, stable, and served over HTTPS.
- Persist Daraja IDs and callback payloads for reconciliation.
- Exercise negative cases in sandbox: invalid bill refs, user-cancelled STK flows, delayed callbacks, and timeout routes.
- Separate sandbox and production credentials and callback paths.

## Production readiness checks

- Rotate test credentials out of any shared environments.
- Verify your initiator user and security credential are valid for the products you will use.
- Confirm support ownership for callback outages, reconciliation, and reversals.
- Make sure your logs never print raw secrets.

## Deployment checklist

1. Switch `MPESA_ENVIRONMENT` to `production`.
2. Load the production credentials and shortcode values.
3. Re-register any URLs required by the product in the production profile.
4. Smoke test with a low-risk transaction path and confirm callback handling before broader traffic.

## Official reference

Safaricom exposes a go-live guide through the [Daraja docs portal](https://developer.safaricom.co.ke/docs#step-by-step-go-live-guide). Use that portal as the source of truth for profile approval steps and product-specific production enablement.
