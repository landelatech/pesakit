---
title: End-to-End STK Payment Flow
description: Build an STK checkout that creates a pending payment, receives the callback, and recovers delayed results safely.
sidebar:
  order: 2
---

## What this guide covers

This is the practical flow most teams need in production:

1. Create a pending payment record in your system.
2. Send the STK push.
3. Persist Daraja request IDs.
4. Receive the callback and mark the payment as paid or failed.
5. Recover incomplete records with STK query if the callback is delayed.

## Prerequisites

- You already have your [credentials configured](/getting-started/configuration/).
- Your shortcode and passkey are enabled for the STK product you are using.
- Your callback URL is public and served over HTTPS.

## Step 1: create the client

```ts
import { Mpesa } from "@landelatech/mpesa-node";

export const mpesa = new Mpesa({
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  environment: process.env.MPESA_ENVIRONMENT === "production" ? "production" : "sandbox",
  shortCode: process.env.MPESA_SHORT_CODE,
  passKey: process.env.MPESA_PASS_KEY,
});
```

## Step 2: create a pending payment and initiate STK

Create your own application record before you call Daraja. That gives you a stable place to persist request IDs and retry state.

```ts
export async function createCheckout(order: {
  id: string;
  phoneNumber: string;
  amount: number;
}) {
  await paymentsRepo.insert({
    orderId: order.id,
    phoneNumber: order.phoneNumber,
    amount: order.amount,
    status: "pending",
  });

  const response = await mpesa.stkPush({
    phoneNumber: order.phoneNumber,
    amount: order.amount,
    callbackUrl: "https://example.com/mpesa/stk",
    accountReference: order.id,
    transactionDesc: `Order ${order.id}`,
  });

  await paymentsRepo.updateByOrderId(order.id, {
    checkoutRequestId: response.CheckoutRequestID,
    merchantRequestId: response.MerchantRequestID,
    status: "submitted",
  });

  return response;
}
```

## Step 3: treat the callback as the final payment event

The callback is where you decide whether the payment actually succeeded.

```ts
import { getStkMetadata, parseStkPushCallback } from "@landelatech/mpesa-node";

app.post("/mpesa/stk", async (req, res) => {
  const payload = parseStkPushCallback(req.body);

  if (payload.ResultCode !== 0) {
    await paymentsRepo.updateByCheckoutRequestId(payload.CheckoutRequestID, {
      status: "failed",
      failureCode: payload.ResultCode,
      failureReason: payload.ResultDesc,
      callbackPayload: payload,
    });

    res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });
    return;
  }

  const metadata = getStkMetadata(payload);

  await paymentsRepo.updateByCheckoutRequestId(payload.CheckoutRequestID, {
    status: "paid",
    mpesaReceiptNumber: metadata?.mpesaReceiptNumber ?? null,
    transactionDate: metadata?.transactionDate ?? null,
    phoneNumber: metadata?.phoneNumber ?? null,
    callbackPayload: payload,
  });

  res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });
});
```

## Step 4: recover delayed callbacks with STK query

Do not run STK query immediately after every request. Use it as a recovery path when:

- the callback is late
- your receiver was unavailable
- the customer claims they approved the payment but your system still shows `pending`

```ts
export async function recoverPendingPayment(checkoutRequestId: string) {
  const status = await mpesa.stkQuery({ checkoutRequestId });

  await paymentsRepo.updateByCheckoutRequestId(checkoutRequestId, {
    queryResultCode: status.ResultCode ?? null,
    queryResultDesc: status.ResultDesc ?? null,
    lastQueryAt: new Date().toISOString(),
  });

  return status;
}
```

If the query reports success but you still have no callback payload, mark the record for manual review or a second reconciliation pass. Avoid inventing a receipt number from the query response if Daraja has not sent one through the callback.

## What to persist for each payment attempt

| Field | Why keep it |
| ----- | ----------- |
| Internal order or invoice ID | Correlates the Daraja flow to your own business record |
| `CheckoutRequestID` | Main STK recovery and lookup key |
| `MerchantRequestID` | Secondary Daraja request ID |
| Phone number and amount | Useful for support and dispute checks |
| Request timestamp | Helps track user claims and retry timing |
| Callback `ResultCode` and `ResultDesc` | Final outcome and failure reason |
| M-Pesa receipt number | Required for reconciliation and reversals |
| Raw callback payload | Audit trail and debugging |

## A safe state model

- `pending`: your record exists but the STK request has not been sent yet
- `submitted`: Daraja accepted the request
- `paid`: callback confirmed success
- `failed`: callback confirmed failure
- `needs_review`: callback missing or contradictory after recovery checks

## Read next

- [STK Push and Query](/guides/stk-push/)
- [Callbacks and Local Testing](/guides/callbacks/)
- [Callback Reliability and Reconciliation](/operations/callback-reliability/)
