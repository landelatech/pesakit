---
title: Quick Start
description: Install the SDK, configure your Daraja credentials, and make your first STK Push.
sidebar:
  order: 1
---

## Requirements

- Node.js `20+`
- A Safaricom Daraja app with a consumer key and consumer secret
- Yarn classic for this repository; any package manager can consume the published package

## Install

```bash
yarn add @landelatech/mpesa-node
```

## First request

```ts
import { Mpesa } from "@landelatech/mpesa-node";

const mpesa = new Mpesa({
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  environment: "sandbox",
  shortCode: process.env.MPESA_SHORT_CODE,
  passKey: process.env.MPESA_PASS_KEY,
});

const response = await mpesa.stkPush({
  phoneNumber: "254708374149",
  amount: 10,
  callbackUrl: "https://example.com/mpesa/stk",
  accountReference: "order-123",
  transactionDesc: "Order payment",
});

console.log(response.CheckoutRequestID);
```

## Next steps

1. Move your credentials into [environment variables](/getting-started/configuration/).
2. Add a [callback endpoint](/guides/callbacks/) before using asynchronous APIs in a real flow.
3. Use the flow-specific guides for STK Push, C2B, B2C, account balance, transaction status, or reversal.
