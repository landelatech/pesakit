---
title: Transaction Status
description: Ask Daraja for the outcome of an existing transaction when your own record is incomplete.
sidebar:
  order: 6
---

## Query a transaction

```ts
await mpesa.transaction.status({
  transactionId: "ABC123XYZ",
  resultUrl: "https://example.com/mpesa/status/result",
  queueTimeOutUrl: "https://example.com/mpesa/status/timeout",
  remarks: "Status verification",
  occasion: "Callback recovery",
});
```

## Use cases

- You missed or lost the original callback
- You need to reconcile a disputed transaction
- You are repairing an incomplete internal payment record

## Notes

- `identifierType` defaults to `4`.
- `occasion` is optional and useful for internal tracing only.
