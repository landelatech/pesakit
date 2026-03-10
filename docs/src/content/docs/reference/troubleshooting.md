---
title: Troubleshooting
description: Common integration failures and the fastest places to look first.
sidebar:
  order: 2
---

## OAuth fails

- Confirm `consumerKey` and `consumerSecret` match the selected environment.
- Confirm you are not using production credentials against sandbox or the reverse.
- Check whether the host can reach Safaricom endpoints from your deployment environment.

## Requests are accepted but nothing completes

- Check whether your callback URLs are reachable from the public internet.
- Confirm you are persisting and inspecting async result callbacks, not only the synchronous submission response.
- Verify your timeout routes are implemented as well as the result routes.

## C2B simulation fails

- Confirm you are in sandbox mode.
- Check that the shortcode is enabled for the C2B flow you are testing.
- Re-register URLs if you changed tunnel domains or environments.

## STK Push fails often

- Validate the phone number format and shortcode/passkey combination.
- Inspect callback payloads for user-cancelled or timeout outcomes.
- Make sure the paybill/till configuration matches the transaction type you are submitting.

## Balance, status, or reversal never show final state

- Those APIs are asynchronous. Confirm the result and timeout URLs are live and correctly routed.
- Persist the `ConversationID` and `OriginatorConversationID` from the submission response so you can match the later callback.
