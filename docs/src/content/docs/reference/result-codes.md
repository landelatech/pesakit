---
title: Result and Status Reference
description: Interpret accepted requests, final callbacks, timeout notifications, and the most important Daraja result meanings used by this SDK.
sidebar:
  order: 2
---

## Read Daraja responses in two stages

Most Daraja APIs have two distinct stages:

1. The synchronous API response says whether Daraja accepted the request for processing.
2. The asynchronous callback says whether the payment or operation actually finished successfully.

Do not treat an accepted request as final financial success.

## STK Push status model

| Stage | Field to inspect | Meaning |
| ----- | ---------------- | ------- |
| Initial API response | `ResponseCode === "0"` | Daraja accepted the STK request |
| STK callback | `ResultCode === 0` | customer approved and the payment completed |
| STK callback | `ResultCode !== 0` | payment failed or was cancelled |
| STK query | `ResultCode` and `ResultDesc` | recovery signal when callback timing is uncertain |

## Common result codes you should recognize

| Code | Where you see it | Meaning |
| ---- | ---------------- | ------- |
| `0` | STK callback, Daraja result callback | success |
| `1` | C2B validation response that you send back | reject the transaction |
| `1032` | STK callback | customer cancelled the STK prompt |

Safaricom may return other non-zero codes over time. Keep your business logic tolerant: treat `0` as success, treat known codes specially when useful, and log unknown non-zero codes instead of hardcoding exhaustive assumptions.

## C2B validation response codes

| `ResultCode` | Meaning |
| ------------ | ------- |
| `0` | accept and allow the transaction to continue |
| `1` | reject the transaction |

The SDK exposes `C2B_VALIDATION_ACCEPT` and `C2B_VALIDATION_REJECT` so you do not have to build this response shape yourself.

## Async result callbacks for B2C, balance, status, and reversal

These flows use the `Result` wrapper parsed by `parseDarajaResult()`.

| Field | Meaning |
| ----- | ------- |
| `Result.ResultCode === 0` | final operation success |
| `Result.ResultCode !== 0` | final operation failure |
| `Result.OriginatorConversationID` | caller-side correlation ID |
| `Result.ConversationID` | Daraja-side conversation ID |
| `Result.TransactionID` | transaction identifier when provided |

Use `getResultParametersMap()` to flatten result parameters into a normal object for logging and persistence.

## Timeout vs final status

- A timeout callback is not the same as a final result callback.
- Timeouts should move the record into a recoverable state such as `timed_out` or `needs_review`.
- Final result callbacks should carry the authoritative outcome when they arrive.

## IDs worth storing by flow

| Flow | IDs to persist |
| ---- | -------------- |
| STK | `CheckoutRequestID`, `MerchantRequestID`, M-Pesa receipt number |
| C2B | `TransID`, bill reference, shortcode |
| B2C | `ConversationID`, `OriginatorConversationID`, `TransactionID` if present |
| Balance / status / reversal | `ConversationID`, `OriginatorConversationID`, `TransactionID` if present |

## Related docs

- [Error Reference](/reference/errors/)
- [Troubleshooting](/reference/troubleshooting/)
- [Callback Reliability and Reconciliation](/operations/callback-reliability/)
