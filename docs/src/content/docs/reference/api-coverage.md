---
title: API Coverage
description: See how the current PesaKit surface maps to the broader Daraja catalog and where the SDK intentionally draws the line.
sidebar:
  order: 4
---

## Status guide

| Status | Meaning |
| ------ | ------- |
| `Implemented` | Available in PesaKit today |
| `Internal only` | Used by the SDK internally, but not exposed as a primary user-facing module |
| `Not implemented` | Not in the package today, but part of the broader Daraja catalog |
| `Out of scope` | Intentionally excluded because it usually depends on special onboarding, commercial agreements, fees, or a niche workflow outside the SDK focus |
| `Catalog only` | Shown in the Daraja catalog, but not really a callable SDK API surface for this package |

## Daraja catalog matrix

| Catalog item | Category | Status | Notes |
| ------------ | -------- | ------ | ----- |
| Getting Started | Experience | `Catalog only` | Documentation/onboarding entry, not an SDK API |
| Authorization (OAuth 2.0) | Security | `Internal only` | Handled automatically by PesaKit token management |
| Dynamic QR | Payments | `Implemented` | Exposed as `mpesa.qr.generate()` |
| M-Pesa Express Simulate | Payments | `Implemented` | Exposed as `mpesa.stkPush()` |
| M-Pesa Express Query | Payments | `Implemented` | Exposed as `mpesa.stkQuery()` |
| Customer To Business (C2B) | Payments | `Implemented` | URL registration, callback handling, and sandbox simulation are covered |
| Customer To Business Register URL | Payments | `Implemented` | Exposed as `mpesa.c2b.registerUrls()` |
| Business To Customer (B2C) | Disbursement | `Implemented` | Exposed as `mpesa.b2c.send()` |
| Transaction Status | Payments | `Implemented` | Exposed as `mpesa.transaction.status()` |
| Account Balance | Payments | `Implemented` | Exposed as `mpesa.account.balance()` |
| Reversals | Payments | `Implemented` | Exposed as `mpesa.reversal.reverse()` |
| Tax Remittance | Payments | `Not implemented` | Tracked in the matrix, not currently wrapped |
| Business Pay Bill | Payments | `Not implemented` | Part of the broader B2B-style Daraja surface |
| Business Buy Goods | Payments | `Not implemented` | Part of the broader B2B-style Daraja surface |
| B2B Express CheckOut | Payments | `Not implemented` | Not currently wrapped |
| Pull Transactions | Experience | `Not implemented` | Useful for reconciliation, but not currently wrapped |
| Business To Pochi | Disbursement | `Out of scope` | Usually depends on extra onboarding, wallet prerequisites, and narrower partner setup |
| SWAP | Security | `Out of scope` | Commercial onboarding, fraud-check workflow, and separate Safaricom approval path |
| IMSI | Security | `Out of scope` | Commercial onboarding, fraud-check workflow, and separate Safaricom approval path |
| B2C Account Top Up | Payments | `Not implemented` | Not currently wrapped; more specialized than the core payout surface |
| M-Pesa Ratiba | Payments | `Out of scope` | Standing-order product with special onboarding and commercial agreement requirements |
| Bill Manager | Experience | `Catalog only` | Broader platform workflow, not a normal SDK API surface here |
| IoT SIM Management | Experience | `Out of scope` | Outside the M-Pesa payment integration focus of this SDK |

## What PesaKit is optimized for

PesaKit is intentionally focused on the M-Pesa flows most Node teams need for normal payment and operational work:

- STK checkout flows
- Dynamic QR generation
- C2B collection flows
- B2C payout flows
- balance, status, and reversal operations
- callback-safe backend integrations

That focus is deliberate. Daraja exposes a wider catalog than the SDK should try to wrap all at once.

## What we intentionally leave out

Some Daraja catalog items are not a good fit for the core package because they usually involve one or more of the following:

- prior approval from Safaricom
- signed commercial agreements
- per-call or connection fees
- special account conversion or wallet prerequisites
- a narrower enterprise workflow than the typical Node.js payment integration

That is why APIs such as `SWAP`, `IMSI`, `Ratiba`, and `Business To Pochi` are documented in the matrix but intentionally excluded from the PesaKit surface.

If your team needs one of those integrations, you can reach out to [Landela Tech](https://landelatech.com/) for bespoke implementation support.

## Reading this matrix

- This matrix maps the current package against the broader Daraja catalog you reviewed; it is not a promise that every Daraja item should or will be added.
- Daraja product visibility and enablement can vary by profile, account approval, and portal changes.
- The [Safaricom API catalog](https://developer.safaricom.co.ke/apis) remains the starting point for current product discovery.
