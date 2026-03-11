---
title: Go Live Checklist
description: Prepare your integration for production rollout with the SDK and the Daraja portal.
sidebar:
  order: 3
---

## Before you request production access

- Confirm every callback URL is public, stable, and served over HTTPS.
- Persist Daraja IDs and callback payloads for reconciliation.
- Exercise negative cases in sandbox: invalid bill refs, user-cancelled STK flows, delayed callbacks, and timeout routes.
- Separate sandbox and production credentials and callback paths.
- Confirm you have the correct M-Pesa account type and shortcode product enablement for the flow you plan to launch, such as paybill, till, or B2C-enabled shortcode.
- If you rely on C2B validation, confirm the shortcode has external validation enabled before you design business logic around the validation callback.

## Production readiness checks

- Rotate test credentials out of any shared environments.
- Verify your initiator user and security credential are valid for the products you will use.
- Confirm you can access the M-Pesa portal with an Admin or Business Manager account for the live organization.
- Confirm support ownership for callback outages, reconciliation, and reversals.
- Make sure your logs never print raw secrets.
- Make sure you have a documented [callback reliability and reconciliation](/operations/callback-reliability/) process before launch.
- If you restrict inbound traffic, make sure the Daraja callback source IPs are allowlisted before you switch on live traffic.

## Deployment checklist

1. Switch `MPESA_ENVIRONMENT` to `production`.
2. Load the production credentials and shortcode values.
3. Confirm the final production C2B URLs carefully before registration, because production URL registration is not a casual repeatable deploy step.
4. Re-register any URLs required by the product in the production profile.
5. Smoke test with a low-risk transaction path and confirm callback handling before broader traffic.
6. Verify the production `securityCredential` was generated with the production public key certificate.

## Official reference

Safaricom exposes a go-live guide through the [Daraja docs portal](https://developer.safaricom.co.ke/docs#step-by-step-go-live-guide). Use that portal as the source of truth for profile approval steps and product-specific production enablement.

If your team does not yet have the right organization admin access, Daraja's onboarding guidance points teams to the M-Pesa Business onboarding contact at `m-pesabusiness@safaricom.co.ke`.
