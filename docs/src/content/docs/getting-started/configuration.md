---
title: Configuration
description: Configure credentials, environment selection, shortcode details, and operational secrets.
sidebar:
  order: 2
---

## Resolution rules

- Explicit constructor config wins.
- Missing values fall back to environment variables.
- Missing auth credentials fail fast with `MpesaValidationError`.
- Invalid `environment` values fail fast instead of silently defaulting.

## Supported environment variables

| Variable                    | Purpose                                                   |
| --------------------------- | --------------------------------------------------------- |
| `MPESA_CONSUMER_KEY`        | Daraja app consumer key                                   |
| `MPESA_CONSUMER_SECRET`     | Daraja app consumer secret                                |
| `MPESA_ENVIRONMENT`         | `sandbox` or `production`                                 |
| `MPESA_SHORT_CODE`          | Paybill or till number                                    |
| `MPESA_PASS_KEY`            | Lipa Na M-Pesa online passkey                             |
| `MPESA_INITIATOR_NAME`      | Initiator username for B2C, balance, status, and reversal |
| `MPESA_SECURITY_CREDENTIAL` | Encrypted initiator password                              |

## Constructor example

```ts
const mpesa = new Mpesa({
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  environment: "sandbox",
  shortCode: process.env.MPESA_SHORT_CODE,
  passKey: process.env.MPESA_PASS_KEY,
  initiatorName: process.env.MPESA_INITIATOR_NAME,
  securityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
});
```

## Which credentials are needed where

- STK Push and STK Query need `shortCode` and `passKey`.
- C2B register URLs and sandbox simulation need `shortCode`.
- B2C, account balance, transaction status, and reversal need `shortCode`, `initiatorName`, and `securityCredential`.

## Security notes

- Do not commit real Daraja credentials.
- Generate `securityCredential` from the initiator password using Safaricom’s approved RSA flow for your profile.
- Keep sandbox and production values separate. Mixing credentials across environments is a common source of `MpesaAuthError` and `MpesaRequestError` failures.
