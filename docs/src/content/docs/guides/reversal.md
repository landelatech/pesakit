---
title: Reversal
description: Reverse a completed M-Pesa transaction with typed request validation and callback handling.
sidebar:
  order: 6
---

## Request a reversal

```ts
await mpesa.reversal.reverse({
  transactionId: "OEI2AK4Q16",
  amount: 100,
  resultUrl: "https://example.com/mpesa/reversal/result",
  queueTimeOutUrl: "https://example.com/mpesa/reversal/timeout",
  remarks: "Duplicate debit",
  occasion: "Customer refund",
});
```

## Wire-level note

Daraja’s reversal payload uses the misspelled field name `RecieverIdentifierType` on the wire. The SDK keeps that API quirk internal and exposes a correctly spelled `receiverIdentifierType` input in TypeScript.

## Defaults

- `commandId` defaults to `TransactionReversal`
- `receiverParty` defaults to your configured shortcode
- `receiverIdentifierType` defaults to `4`

## Operational advice

- Capture the original `TransactionID` from your callback or settlement records before attempting a reversal.
- Store both synchronous response IDs and the later async result payload for auditability.
