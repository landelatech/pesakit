---
title: Error Reference
description: Understand SDK errors, async result envelopes, and the failure details to log.
sidebar:
  order: 1
---

## SDK error classes

| Error                  | Meaning                                                                        | What to inspect                                                         |
| ---------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| `MpesaValidationError` | Input or config is incomplete or malformed                                     | Constructor config, environment variables, phone numbers, callback URLs |
| `MpesaAuthError`       | OAuth token fetch failed                                                       | Credentials, environment mismatch, network reachability                 |
| `MpesaRequestError`    | Daraja returned a non-OK response or the request failed at the transport layer | `statusCode`, `responseBody`, and your request payload                  |
| `MpesaCallbackError`   | A callback body does not match the expected shape                              | Raw callback body and route selection                                   |

## What to log

- The SDK error name
- `statusCode` for `MpesaRequestError`
- `responseBody` for request and auth failures
- Your own correlation identifiers such as order IDs and `CheckoutRequestID`

## Daraja result envelopes

- Synchronous request success means the request was accepted, not completed.
- Final success or failure usually arrives through the async callback route.
- For STK callbacks, `ResultCode === 0` is success. A common failure example is user-cancelled STK authorization with `1032`.

## Good practice

Normalize your own application error shape around the SDK errors rather than matching raw Daraja strings directly. `responseBody` is useful for debugging but not stable enough to become your business logic contract.
