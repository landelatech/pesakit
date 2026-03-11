---
title: Callback Reliability and Reconciliation
description: Design callback receivers that tolerate duplicates, delays, timeouts, and missing events without losing financial state.
sidebar:
  order: 2
---

## Why this matters

Daraja integrations are asynchronous. If you only look at the first API response, you will eventually misclassify payments or payouts.

Production-safe integrations assume:

- callbacks can arrive late
- callbacks can be retried
- timeout notifications can arrive before a final result
- your own receiver can be down temporarily

## Endpoint map by API

| Flow | Primary callback | Secondary callback or recovery path |
| ---- | ---------------- | ----------------------------------- |
| STK Push | `callbackUrl` | `stkQuery()` if callback is delayed |
| C2B | `confirmationUrl` | `validationUrl` before completion |
| B2C | `resultUrl` | `queueTimeOutUrl` plus reconciliation |
| Account balance | `resultUrl` | `queueTimeOutUrl` |
| Transaction status | `resultUrl` | `queueTimeOutUrl` |
| Reversal | `resultUrl` | `queueTimeOutUrl` |

## Idempotency rules

Your callback handlers should be safe to run more than once.

- For STK, key idempotency on `CheckoutRequestID`.
- For C2B confirmation, key idempotency on `TransID`.
- For B2C, account balance, transaction status, and reversal, key idempotency on `ConversationID` and `OriginatorConversationID`.
- If the same callback arrives twice, do not create a second payment or payout record.

## What to persist

At minimum, keep:

- your own business record ID, such as order ID, payout batch ID, or reconciliation task ID
- Daraja correlation IDs
- current internal status such as `submitted`, `paid`, `failed`, `timed_out`, or `needs_review`
- raw callback payloads
- timestamps for first seen, last seen, and any retries
- M-Pesa receipt number or transaction ID when available

## Timeout callbacks are not the same as final failure

`queueTimeOutUrl` means the workflow did not finish in time from Daraja's perspective.

- Record the timeout immediately.
- Do not automatically resend money or retry the payment.
- Schedule reconciliation first.
- If a later final callback arrives, let that final callback win.

## A practical reconciliation loop

Use a periodic worker to review records stuck in intermediate states.

1. Find records in `submitted` or `timed_out` state beyond your expected callback window.
2. For STK, run `stkQuery()` using the stored `CheckoutRequestID`.
3. For B2C, reversal, balance, or status flows, inspect stored conversation IDs and your operational logs.
4. Move ambiguous records to `needs_review` instead of guessing.
5. Keep every recovery attempt in your audit history.

## Suggested outcome rules

- Callback success beats synchronous acceptance.
- Callback failure beats synchronous acceptance.
- Timeout creates uncertainty, not final business truth.
- Reconciliation results should update the record, but they should not erase the original callback history.

## When to escalate manually

Escalate to finance or support when:

- the customer reports payment success but you never received the callback
- you have conflicting status between a callback and your internal ledger
- a payout timed out and the beneficiary claims they still received funds
- you need to decide whether to trigger [Transaction Status](/guides/transaction-status/) or [Reversal](/guides/reversal/)

## Related docs

- [Callbacks and Local Testing](/guides/callbacks/)
- [End-to-end STK payment flow](/guides/end-to-end-stk/)
- [Go Live Checklist](/operations/go-live/)
