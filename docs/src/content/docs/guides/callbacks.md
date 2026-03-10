---
title: Callbacks and Local Testing
description: Receive and parse Daraja callbacks safely in your Node.js application.
sidebar:
  order: 7
---

## Use parsers inside your existing routes

```ts
import {
  C2B_VALIDATION_ACCEPT,
  getStkMetadata,
  parseC2BValidation,
  parseStkPushCallback,
} from "@landelatech/mpesa-node";

app.post("/mpesa/stk", (req, res) => {
  const payload = parseStkPushCallback(req.body);
  const metadata = getStkMetadata(payload);
  console.log(metadata);
  res.json({ ResultCode: 0, ResultDesc: "Success" });
});

app.post("/mpesa/c2b/validate", (req, res) => {
  parseC2BValidation(req.body);
  res.json(C2B_VALIDATION_ACCEPT);
});
```

## Or let the SDK create the HTTP handler

```ts
import { createServer } from "node:http";
import { createCallbackHandler, stkPushRoute } from "@landelatech/mpesa-node";

const handler = createCallbackHandler({
  routes: {
    "/mpesa/stk": stkPushRoute((payload) => {
      console.log(payload.CheckoutRequestID);
    }),
  },
});

createServer(handler).listen(3000);
```

## Local testing

- Run the local callback server on a fixed port.
- Expose it with a tunnel such as ngrok or another HTTPS-capable tunnel.
- Register the public URL in the Daraja portal or request body, depending on the API.
