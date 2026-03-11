---
title: Get Sandbox Credentials
description: Set up your Daraja sandbox app and gather the credentials required by the SDK.
sidebar:
  order: 1
---

## Use the official portal

Safaricom’s primary entry points are the [API catalog](https://developer.safaricom.co.ke/apis) and the [documentation portal](https://developer.safaricom.co.ke/docs#step-by-step-go-live-guide). The portal is where you create apps, request product access, and gather the values this SDK expects.

## Typical sandbox checklist

1. Create or open your Daraja app in the Safaricom developer portal.
2. Copy the sandbox `consumerKey` and `consumerSecret`.
3. Add the sandbox shortcode and passkey for STK or C2B testing.
4. Create an initiator user and encrypted `securityCredential` if you plan to test B2C, balance, status, or reversal.
5. Put those values in a local `.env` file that is excluded from git.

## What Daraja means by shortcode

- A shortcode is the business number used to receive or send funds through the enabled product on your profile.
- A paybill is typically used to collect money from customers repeatedly.
- Buy goods is commonly used for retail purchases.
- A till number is the buy-goods store identifier attached to that retail collection flow.

For this SDK, what matters is not only the number itself, but also which Daraja products Safaricom has enabled on that shortcode.

## Before testing B2C-style APIs

- Make sure you have an initiator user in the portal.
- Generate `securityCredential` with the sandbox public key certificate, not the production one.
- Keep the unencrypted initiator password out of source control and shared logs.

## Map values to the SDK

- `consumerKey` -> `MPESA_CONSUMER_KEY`
- `consumerSecret` -> `MPESA_CONSUMER_SECRET`
- sandbox or production selector -> `MPESA_ENVIRONMENT`
- shortcode -> `MPESA_SHORT_CODE`
- STK passkey -> `MPESA_PASS_KEY`
- initiator username -> `MPESA_INITIATOR_NAME`
- encrypted credential -> `MPESA_SECURITY_CREDENTIAL`

## Practical tip

Keep one `.env` file per account or environment. Accidentally mixing sandbox and production values is one of the fastest ways to burn time on avoidable auth failures.
