# @landelatech/mpesa-node

[![Build](https://github.com/landelatech/mpesa-node/actions/workflows/build.yml/badge.svg)](https://github.com/landelatech/mpesa-node/actions/workflows/build.yml)

Typed Node.js SDK for Safaricom M-Pesa Daraja APIs. The package ships a single `Mpesa` client with automatic OAuth, request validation, typed errors, callback helpers, and fluent modules for the implemented Daraja flows.

## Requirements

- Node.js `20+`
- ESM runtime

## Install

```bash
yarn add @landelatech/mpesa-node
```

## Quick start

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

## Implemented modules

- `mpesa.stkPush()` and `mpesa.stkQuery()`
- `mpesa.c2b.registerUrls()` and `mpesa.c2b.simulate()`
- `mpesa.b2c.send()`
- `mpesa.account.balance()`
- `mpesa.transaction.status()`
- `mpesa.reversal.reverse()`

## Documentation

- Docs site: [landelatech.github.io/mpesa-node](https://landelatech.github.io/mpesa-node/)
- Local docs dev server: `yarn docs:dev`

The docs cover setup, configuration, callbacks, sandbox credentials, go-live preparation, troubleshooting, error handling, and the current API coverage matrix.

## Node runtime note

This package targets Node.js. It is not a browser SDK and it is not designed for edge runtimes without Node compatibility.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the contributor workflow, quality gates, and documentation process.

## License

MIT. See [LICENSE](./LICENSE).
