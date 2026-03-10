---
title: B2C Payments
description: Send money from your shortcode to a customer and handle the asynchronous result.
sidebar:
  order: 3
---

## Send a payout

```ts
await mpesa.b2c.send({
  recipientPhone: "254712345678",
  amount: 500,
  resultUrl: "https://example.com/mpesa/b2c/result",
  queueTimeOutUrl: "https://example.com/mpesa/b2c/timeout",
  remarks: "Partner settlement",
  occasion: "March payout",
});
```

## Notes

- `commandId` defaults to `BusinessPayment`.
- You can override it with `SalaryPayment` or `PromotionPayment`.
- Treat the synchronous API response as submission acknowledgment only. Final status arrives through the result URL.

## Required config

- `shortCode`
- `initiatorName`
- `securityCredential`
