---
title: STK Push and Query
description: Prompt a customer on their phone and track the payment state safely.
sidebar:
  order: 1
---

## Start a push

```ts
const response = await mpesa.stkPush({
  phoneNumber: "254708374149",
  amount: 100,
  callbackUrl: "https://example.com/mpesa/stk",
  accountReference: "invoice-001",
  transactionDesc: "Subscription payment",
});
```

## Query later

```ts
const status = await mpesa.stkQuery({
  checkoutRequestId: response.CheckoutRequestID,
});
```

## Operational guidance

- Treat the callback as the primary source of truth for successful payments.
- Use STK query when the callback is delayed or your receiver was unavailable.
- Keep `accountReference` and `transactionDesc` meaningful enough to correlate the payment on your side.

## Validation done by the SDK

- Phone number normalization to Kenyan `254...` format
- Positive amount enforcement
- Callback URL validation
- Shortcode and passkey presence checks
