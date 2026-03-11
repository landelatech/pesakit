---
title: Account Balance
description: Request the current balance for a shortcode and receive the final result asynchronously.
sidebar:
  order: 6
---

## Request a balance

```ts
await mpesa.account.balance({
  resultUrl: "https://example.com/mpesa/balance/result",
  queueTimeOutUrl: "https://example.com/mpesa/balance/timeout",
  remarks: "Daily balance check",
});
```

## SDK behavior

- If you do not pass `remarks`, the SDK sends `Account balance query`.
- `identifierType` defaults to `4`, which fits shortcode-based account balance requests.

## Recommended use

- Run this from an operational worker or back-office tool.
- Persist `ConversationID` and `OriginatorConversationID` so you can match the later callback payload.
