---
title: C2B Register URLs and Simulation
description: Register validation and confirmation URLs, then test your flow in the sandbox.
sidebar:
  order: 3
---

## What C2B means

C2B stands for customer-to-business. In this flow, the customer pays into your shortcode and Daraja sends your system validation and confirmation callbacks around that payment.

- Use this when the customer initiates the payment toward your business.
- Use [STK Push and Query](/guides/stk-push/) if your system should trigger the prompt on the customer phone.
- Use [B2C Payments](/guides/b2c/) if your business is sending money out to a customer.

## Which shortcode type applies

- `CustomerPayBillOnline` is the paybill-oriented simulation command.
- `CustomerBuyGoodsOnline` is the buy-goods or till-oriented simulation command.
- In production, the shortcode and enabled Daraja products on your Safaricom profile determine what is actually allowed.

## Daraja terminology that matters here

- Short code: the business number receiving customer payments.
- Pay Bill: typically used when customers pay a bill or account reference.
- Buy Goods: typically used for retail payments for goods or services.
- Till Number: the store identifier attached to a buy-goods profile.

## Required config

| Value                              | Why it is needed                                                 |
| ---------------------------------- | ---------------------------------------------------------------- |
| `consumerKey` and `consumerSecret` | OAuth access token generation                                    |
| `environment`                      | Sandbox vs production behavior                                   |
| `shortCode`                        | The business shortcode receiving the customer payment            |
| `validationUrl`                    | Optional gate before completion, if your profile uses validation |
| `confirmationUrl`                  | Final payment receipt callback                                   |

## Register your URLs

```ts
await mpesa.c2b.registerUrls({
  confirmationUrl: "https://example.com/mpesa/c2b/confirm",
  validationUrl: "https://example.com/mpesa/c2b/validate",
  responseType: "Completed",
});
```

## What the endpoints do

- `validationUrl` runs before the payment completes. Use it to reject bad account numbers, bill references, or invalid customer context.
- `confirmationUrl` runs after the payment completes. Treat it as the durable payment receipt event.
- `responseType: "Completed"` tells Daraja to complete the transaction when your endpoint accepts it.
- Daraja expects these routes to be reachable from the public internet, not only from your local machine.

## How Register URL behaves at runtime

- If external validation is disabled on the shortcode, M-Pesa skips validation and only sends the confirmation callback after a successful payment.
- If external validation is enabled and your validation endpoint responds in time, M-Pesa follows your validation response and then sends confirmation when the transaction completes.
- If external validation is enabled but M-Pesa cannot reach your validation endpoint in time, M-Pesa falls back to the registered `responseType`.
- If no URLs are registered at all, M-Pesa auto-completes the transaction and you should not expect your system to receive the C2B callbacks.

## External validation is optional

Validation is not automatically active on every paybill or till.

- The shortcode owner must ask Safaricom to enable external validation for that shortcode.
- If validation is not enabled, your `validationUrl` will not be called even if you registered it.
- Confirmation callbacks are still the important receipt event for completed transactions.

## Implement validation and confirmation handlers

```ts
import {
  C2B_VALIDATION_ACCEPT,
  C2B_VALIDATION_REJECT,
  c2bValidationResponse,
  parseC2BConfirmation,
  parseC2BValidation,
} from "@landelatech/pesakit";

app.post("/mpesa/c2b/validate", (req, res) => {
  const payload = parseC2BValidation(req.body);
  const billRefIsKnown = payload.BillRefNumber.startsWith("invoice-");

  res.json(billRefIsKnown ? C2B_VALIDATION_ACCEPT : c2bValidationResponse("C2B00012", "Rejected"));
});

app.post("/mpesa/c2b/confirm", async (req, res) => {
  const payload = parseC2BConfirmation(req.body);

  await paymentsRepo.recordC2BConfirmation({
    transactionId: payload.TransID,
    amount: payload.TransAmount,
    billRefNumber: payload.BillRefNumber,
    msisdn: payload.MSISDN,
    payload,
  });

  res.status(200).send("OK");
});
```

Use `C2B_VALIDATION_ACCEPT` for approval. For rejection, you can use the default `C2B_VALIDATION_REJECT` helper or send a more specific Daraja code such as:

- `C2B00011` invalid MSISDN
- `C2B00012` invalid account number
- `C2B00013` invalid amount
- `C2B00014` invalid KYC details
- `C2B00015` invalid shortcode
- `C2B00016` other error

## Simulate in sandbox

```ts
await mpesa.c2b.simulate({
  amount: 100,
  msisdn: "254712345678",
  billRefNumber: "invoice-001",
  commandId: "CustomerPayBillOnline",
});
```

## Important behavior

- `simulate()` is sandbox-only and the SDK will reject production usage.
- Validation and confirmation routes should be real public URLs when you test against Daraja.
- The SDK normalizes the API response shape so you consistently receive `OriginatorConversationID` even if older samples use a misspelled variant.
- Sandbox URL registration is easy to repeat or overwrite. Production registration is operationally sensitive and typically treated as a one-time action until changed through portal self-service or Safaricom support.

## When to use validation vs confirmation

- Validation runs before completion and lets you reject bad bill references or account numbers.
- Confirmation runs after payment completion and should be treated as your payment receipt event.
- If you do not need business-side prechecks, keep validation logic minimal and make confirmation your source of truth.
- Your validation endpoint needs to respond quickly. Daraja documentation indicates M-Pesa may stop waiting in under about 8 seconds and then apply the registered default action.

## Read next

- [Callbacks and Local Testing](/guides/callbacks/)
- [Callback Reliability and Reconciliation](/operations/callback-reliability/)
- [Result and Status Reference](/reference/result-codes/)
