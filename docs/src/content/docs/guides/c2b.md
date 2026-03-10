---
title: C2B Register URLs and Simulation
description: Register validation and confirmation URLs, then test your flow in the sandbox.
sidebar:
  order: 2
---

## Register your URLs

```ts
await mpesa.c2b.registerUrls({
  confirmationUrl: "https://example.com/mpesa/c2b/confirm",
  validationUrl: "https://example.com/mpesa/c2b/validate",
  responseType: "Completed",
});
```

## Simulate in sandbox

```ts
await mpesa.c2b.simulate({
  amount: 100,
  msisdn: "254712345678",
  billRefNumber: "invoice-001",
});
```

## Important behavior

- `simulate()` is sandbox-only and the SDK will reject production usage.
- Validation and confirmation routes should be real public URLs when you test against Daraja.
- The SDK normalizes the API response shape so you consistently receive `OriginatorConversationID` even if older samples use a misspelled variant.

## When to use validation vs confirmation

- Validation runs before completion and lets you reject bad bill references or account numbers.
- Confirmation runs after payment completion and should be treated as your payment receipt event.
