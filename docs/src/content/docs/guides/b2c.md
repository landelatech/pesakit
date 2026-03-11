---
title: B2C Payments
description: Send money from your shortcode to a customer and handle the asynchronous result.
sidebar:
  order: 4
---

## What B2C means

B2C stands for business-to-customer. This is the disbursement flow where your business sends money out from its shortcode to a customer phone number.

Typical use cases:

- customer refunds
- merchant or agent settlements
- salary or stipend payouts
- promotional or goodwill payments

If the customer is paying you, use [C2B Register URLs and Simulation](/guides/c2b/) or [STK Push and Query](/guides/stk-push/) instead.

## Which shortcode can send a payout

- Use the shortcode that Safaricom has provisioned for B2C on your Daraja profile.
- The SDK will send whichever `shortCode` you configure, but Daraja permissions decide whether the payout is allowed.
- Do not assume every till or paybill can perform B2C. Product enablement matters more than the number format.

## Required config

| Value | Why it is needed |
| ----- | ---------------- |
| `consumerKey` and `consumerSecret` | OAuth access token generation |
| `environment` | Sandbox vs production behavior |
| `shortCode` | The sending organization shortcode |
| `initiatorName` | B2C operator name configured in Daraja |
| `securityCredential` | Encrypted initiator secret required by B2C APIs |
| `resultUrl` | Final async result callback |
| `queueTimeOutUrl` | Timeout callback if Daraja cannot complete the workflow in time |

## Send a payout

```ts
await mpesa.b2c.send({
  recipientPhone: "254712345678",
  amount: 500,
  resultUrl: "https://example.com/mpesa/b2c/result",
  queueTimeOutUrl: "https://example.com/mpesa/b2c/timeout",
  remarks: "Partner settlement",
  occasion: "March payout",
});
```

## Choose the right `commandId`

| `commandId` | Typical use |
| ----------- | ----------- |
| `BusinessPayment` | General disbursements, partner settlements, customer refunds |
| `SalaryPayment` | Payroll-like payouts |
| `PromotionPayment` | Campaign, bonus, or promotional transfers |

- `commandId` defaults to `BusinessPayment`.
- Pick the value that matches the Daraja business purpose you are actually running.

## What the synchronous response means

- Treat the synchronous API response as submission acknowledgment only. Final status arrives through the result URL.
- Persist `ConversationID` and `OriginatorConversationID` so you can match the later callback payload.

## Callback model

- `resultUrl` receives the final B2C result.
- `queueTimeOutUrl` receives a timeout notification when the workflow does not finish in time.
- A timeout does not always mean permanent failure. You may need follow-up reconciliation before retrying.

The callback payload for B2C is parsed with `parseDarajaResult()`, and you can flatten the returned parameters with `getResultParametersMap()`.

## Operational guidance

- Do not mark the payout as complete from the synchronous response alone.
- Store the raw result callback for audit and support work.
- Keep your remarks and occasion fields meaningful enough for finance and operations teams.
- If you need to recover an ambiguous payout, use your stored conversation IDs together with your operational reconciliation process.

## Read next

- [Callbacks and Local Testing](/guides/callbacks/)
- [Callback Reliability and Reconciliation](/operations/callback-reliability/)
- [Go Live Checklist](/operations/go-live/)
