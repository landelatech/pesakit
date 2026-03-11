---
title: Dynamic QR
description: Generate a Dynamic QR code that lets a customer scan and pay with the M-Pesa or MySafaricom app.
sidebar:
  order: 4
---

## What this flow is for

Dynamic QR lets you generate a scannable QR code for an in-person or assisted checkout. A customer scans the QR code in the M-Pesa or MySafaricom app, reviews the captured payment details, and authorizes the payment.

Use it when:

- you want a scan-to-pay experience at a counter, till, or printed invoice
- the merchant or cashier already knows the amount to be charged
- you want to reduce manual entry of till, paybill, or phone details

Dynamic QR generation is not the same as payment confirmation. The QR code helps the customer initiate the payment; your settlement or callback flow still determines the final outcome.

## Required input

| Value          | Meaning                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------ |
| `merchantName` | merchant or company name embedded in the QR code                                           |
| `refNo`        | invoice or transaction reference                                                           |
| `amount`       | total sale amount                                                                          |
| `trxCode`      | the type of payment target                                                                 |
| `cpi`          | credit party identifier: shortcode, till, business number, or phone depending on `trxCode` |
| `size`         | square image size in pixels                                                                |

## Supported `trxCode` values

| `trxCode` | Meaning                                                       |
| --------- | ------------------------------------------------------------- |
| `BG`      | pay merchant / buy goods                                      |
| `WA`      | withdraw cash at agent till                                   |
| `PB`      | paybill / business number                                     |
| `SM`      | send money to mobile number                                   |
| `SB`      | send to business using business number in MSISDN-style format |

Pick the `trxCode` that matches the payment destination and make sure `cpi` contains the correct identifier for that flow.

## Generate a QR code

```ts
const qr = await mpesa.qr.generate({
  merchantName: "TEST SUPERMARKET",
  refNo: "Invoice Test",
  amount: 1,
  trxCode: "BG",
  cpi: "373132",
  size: 300,
});
```

## What the response contains

- `ResponseCode`: request status identifier returned by Daraja
- `RequestID`: request correlation ID
- `ResponseDescription`: submission status text
- `QRCode`: the QR code image payload as a string

In practice, you will usually embed `QRCode` into an image response or hand it to your frontend to render.

## Operational notes

- Dynamic QR generation is synchronous, unlike callback-driven flows such as STK, B2C, or reversal.
- The SDK validates that `amount` and `size` are positive integers.
- The SDK validates `trxCode` against the known Daraja-supported values.
- You still need your normal payment reconciliation path after the customer scans and authorizes the payment.

## Read next

- [C2B Register URLs and Simulation](/guides/c2b/)
- [STK Push and Query](/guides/stk-push/)
- [API Coverage](/reference/api-coverage/)
