---
title: Callbacks and Local Testing
description: Receive and parse Daraja callbacks safely in your Node.js application.
sidebar:
  order: 8
---

## Which endpoints each flow needs

| Flow | Endpoints you expose | Why they exist |
| ---- | -------------------- | -------------- |
| STK Push | `callbackUrl` | final payment success or failure |
| C2B | `validationUrl`, `confirmationUrl` | pre-check and final payment receipt |
| B2C | `resultUrl`, `queueTimeOutUrl` | final result and timeout notification |
| Account balance | `resultUrl`, `queueTimeOutUrl` | final async result and timeout notification |
| Transaction status | `resultUrl`, `queueTimeOutUrl` | final async result and timeout notification |
| Reversal | `resultUrl`, `queueTimeOutUrl` | final async result and timeout notification |

- Every callback endpoint should be public, stable, and served over HTTPS.
- The SDK validates callback payload shapes, but you still own idempotency, persistence, and business decisions.

## Use parsers inside your existing routes

```ts
import {
  C2B_VALIDATION_ACCEPT,
  C2B_VALIDATION_REJECT,
  getResultParametersMap,
  getStkMetadata,
  parseC2BConfirmation,
  parseC2BValidation,
  parseDarajaResult,
  parseStkPushCallback,
} from "@landelatech/mpesa-node";

app.post("/mpesa/stk", (req, res) => {
  const payload = parseStkPushCallback(req.body);
  const metadata = getStkMetadata(payload);
  console.log(metadata);
  res.json({ ResultCode: 0, ResultDesc: "Success" });
});

app.post("/mpesa/c2b/validate", (req, res) => {
  const payload = parseC2BValidation(req.body);
  const accepted = payload.BillRefNumber.startsWith("invoice-");
  res.json(accepted ? C2B_VALIDATION_ACCEPT : C2B_VALIDATION_REJECT);
});

app.post("/mpesa/c2b/confirm", (req, res) => {
  const payload = parseC2BConfirmation(req.body);
  console.log(payload.TransID, payload.TransAmount);
  res.send("OK");
});

app.post("/mpesa/b2c/result", (req, res) => {
  const payload = parseDarajaResult(req.body);
  const parameters = getResultParametersMap(payload);
  console.log(payload.Result.ResultCode, parameters);
  res.send("OK");
});

app.post("/mpesa/b2c/timeout", (req, res) => {
  console.log("Daraja timeout", req.body);
  res.send("OK");
});
```

## Or let the SDK create the HTTP handler

```ts
import { createServer } from "node:http";
import {
  C2B_VALIDATION_ACCEPT,
  c2BConfirmationRoute,
  c2BValidationRoute,
  createCallbackHandler,
  darajaResultRoute,
  stkPushRoute,
} from "@landelatech/mpesa-node";

const handler = createCallbackHandler({
  routes: {
    "/mpesa/stk": stkPushRoute((payload) => {
      console.log(payload.CheckoutRequestID);
    }),
    "/mpesa/c2b/validate": c2BValidationRoute(() => ({
      body: C2B_VALIDATION_ACCEPT,
    })),
    "/mpesa/c2b/confirm": c2BConfirmationRoute((payload) => {
      console.log(payload.TransID);
    }),
    "/mpesa/b2c/result": darajaResultRoute((payload) => {
      console.log(payload.Result.OriginatorConversationID);
    }),
  },
});

createServer(handler).listen(3000);
```

## What each endpoint should return

- STK callback: return HTTP `200` as soon as you have safely persisted the payload.
- C2B validation: return JSON with `ResultCode` and `ResultDesc`. Use `C2B_VALIDATION_ACCEPT` or `C2B_VALIDATION_REJECT`.
- C2B confirmation: return `200` after persisting the payment event.
- B2C, balance, status, and reversal result URLs: return `200` after storing the async result.
- Timeout URLs: return `200`, record the timeout, and schedule reconciliation.

## How to configure the URLs

- STK: set `callbackUrl` inside `mpesa.stkPush()`.
- C2B: register `validationUrl` and `confirmationUrl` once with `mpesa.c2b.registerUrls()`.
- B2C, account balance, transaction status, and reversal: pass `resultUrl` and `queueTimeOutUrl` in each request.

## Local testing

- Run the local callback server on a fixed port.
- Expose it with a tunnel such as ngrok or another HTTPS-capable tunnel.
- Register the public URL in the Daraja portal or request body, depending on the API.
- Keep sandbox and production callback domains separate so you do not mix live traffic with tests.

## Read next

- [End-to-end STK payment flow](/guides/end-to-end-stk/)
- [Callback Reliability and Reconciliation](/operations/callback-reliability/)
- [Result and Status Reference](/reference/result-codes/)
