---
title: STK Push and Query
description: Prompt a customer on their phone and track the payment state safely.
sidebar:
  order: 1
---

## What this flow is for

STK Push is the checkout flow where your system asks Daraja to prompt the customer on their phone, and the customer approves or rejects the payment in the M-Pesa UI.

- Use it when the customer is actively present in your app, website, or assisted checkout flow.
- Use [B2C Payments](/guides/b2c/) instead when your business is sending money out to a customer.
- Treat the STK request as a payment attempt, not as proof of settlement.

## Which shortcode and transaction type to use

| Business scenario       | `transactionType`       | Typical shortcode profile |
| ----------------------- | ----------------------- | ------------------------- |
| Customer pays a paybill | `CustomerPayBillOnline` | Paybill                   |
| Customer pays a till    | `CustomerBuyGoodsOnline` | Buy goods / till         |

- The SDK defaults to `CustomerPayBillOnline`.
- Use the shortcode and passkey provisioned for that exact Daraja product.
- Do not assume any valid paybill or till can run STK. Safaricom must enable the profile for Lipa Na M-Pesa online.

## Required config

| Value            | Why it is needed |
| ---------------- | ---------------- |
| `consumerKey`    | OAuth access token generation |
| `consumerSecret` | OAuth access token generation |
| `environment`    | Chooses sandbox vs production Daraja base URL |
| `shortCode`      | The business shortcode initiating the push |
| `passKey`        | Used to build the STK password sent on the wire |
| `callbackUrl`    | Receives the final asynchronous payment result |

## Start a push

```ts
const response = await mpesa.stkPush({
  phoneNumber: "254708374149",
  amount: 100,
  callbackUrl: "https://example.com/mpesa/stk",
  accountReference: "invoice-001",
  transactionDesc: "Subscription payment",
  transactionType: "CustomerPayBillOnline",
});
```

## What the immediate response means

- `CheckoutRequestID` is your main correlation ID for later status checks.
- `MerchantRequestID` is another request identifier returned by Daraja.
- `ResponseCode === "0"` means the request was accepted for processing.
- It does not mean the customer has paid yet.

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
- Persist `CheckoutRequestID`, your internal order ID, phone number, amount, and the later callback payload.
- If the callback reports success, also store the M-Pesa receipt number from `getStkMetadata()`.

## Validation done by the SDK

- Phone number normalization to Kenyan `254...` format
- Positive amount enforcement
- Callback URL validation
- Shortcode and passkey presence checks

## Read next

- [End-to-end STK payment flow](/guides/end-to-end-stk/)
- [Callbacks and Local Testing](/guides/callbacks/)
- [Result and Status Reference](/reference/result-codes/)
