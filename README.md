# PesaKit

[![Build](https://github.com/landelatech/mpesa-node/actions/workflows/build.yml/badge.svg)](https://github.com/landelatech/mpesa-node/actions/workflows/build.yml)

`@landelatech/pesakit` is the Node.js toolkit for shipping Safaricom M-Pesa integrations from a backend without hand-rolling OAuth, request signing, callback parsing, or flow-specific payload glue.

PesaKit is built and maintained by [Landela Tech](https://landelatech.com/), the team behind production payment integrations across local and international providers.

PesaKit gives you one `Mpesa` client for the implemented Daraja flows, with built-in OAuth, typed requests and responses, validation at the API boundary, and practical helpers for async callback handling.

## Why use this SDK

- Ship faster from Node.js with less Daraja boilerplate
- Keep payment flows explicit and typed instead of stitching JSON payloads by hand
- Reuse one consistent client for STK Push, Dynamic QR, C2B, B2C, balance, status, and reversal flows
- Recover missing C2B history with pull-based reconciliation for recent transactions
- Handle callback-heavy integrations with typed parsers and a lightweight HTTP callback handler
- Keep credentials flexible: constructor config overrides environment values when needed

## Requirements

- Node.js `20+`
- ESM runtime

## Install

```bash
yarn add @landelatech/pesakit
```

## Quick start

```ts
import { Mpesa } from "@landelatech/pesakit";

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

## What you can build with it

- `mpesa.stkPush()` and `mpesa.stkQuery()`
- `mpesa.c2b.registerUrls()` and `mpesa.c2b.simulate()`
- `mpesa.qr.generate()`
- `mpesa.pull.register()` and `mpesa.pull.query()`
- `mpesa.b2c.send()`
- `mpesa.account.balance()`
- `mpesa.transaction.status()`
- `mpesa.reversal.reverse()`

## Integration goals

This package is intentionally optimized for the day-to-day Daraja integrations most Node teams actually need:

- customer checkout flows
- merchant collection flows
- payout and operational flows
- callback-safe backend integrations
- recent C2B reconciliation and operational recovery

It does not try to wrap every Daraja product. APIs that usually require special onboarding, commercial agreements, or niche enterprise workflows are tracked in the docs implementation matrix but intentionally kept out of the core SDK surface.

## Documentation

- Docs site: [pesakit-docs.landelatech.com](https://pesakit-docs.landelatech.com)
- Hosted docs: deploy `docs/dist` to Netlify and set `SITE_URL=https://pesakit-docs.landelatech.com`
- Local docs dev server: `yarn docs:dev`

The docs cover setup, configuration, STK, Dynamic QR, C2B, Pull Transactions, B2C, callbacks, sandbox credentials, go-live preparation, troubleshooting, error handling, and the current API coverage matrix.

## About Landela Tech

Landela Tech builds practical, production-ready payment infrastructure for businesses working across local and international providers.

- Website: [landelatech.com](https://landelatech.com/)

## Node runtime note

This package targets Node.js. It is not a browser SDK and it is not designed for edge runtimes without Node compatibility.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the contributor workflow, quality gates, and documentation process.

## License

MIT. See [LICENSE](./LICENSE).
