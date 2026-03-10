/**
 * Example: Receive Daraja callbacks with typed payloads.
 * Run: node examples/callbacks-server.mjs
 * Then point your STK callbackUrl / C2B confirmation URL to http://localhost:3000/mpesa/stk and /mpesa/c2b/confirm
 * (use ngrok for a public URL so Daraja can reach you).
 */

import { createServer } from "node:http";
import {
  createCallbackHandler,
  stkPushRoute,
  c2BConfirmationRoute,
  c2BValidationRoute,
  getStkMetadata,
  C2B_VALIDATION_ACCEPT,
} from "../dist/index.js";

const handler = createCallbackHandler({
  routes: {
    "/mpesa/stk": stkPushRoute(async (payload) => {
      console.log("[STK] ResultCode:", payload.ResultCode, payload.ResultDesc);
      if (payload.ResultCode === 0) {
        const meta = getStkMetadata(payload);
        if (meta) {
          console.log("[STK] Success:", {
            receipt: meta.mpesaReceiptNumber,
            amount: meta.amount,
            phone: meta.phoneNumber,
            date: meta.transactionDate,
          });
        }
      }
    }),

    "/mpesa/c2b/confirm": c2BConfirmationRoute((p) => {
      console.log("[C2B Confirm]", {
        TransID: p.TransID,
        Amount: p.TransAmount,
        MSISDN: p.MSISDN,
        BillRefNumber: p.BillRefNumber,
      });
    }),

    "/mpesa/c2b/validate": c2BValidationRoute((p) => {
      console.log("[C2B Validate]", p.BillRefNumber, p.TransAmount);
      // Accept all for demo; in production validate BillRefNumber etc.
      return { statusCode: 200, body: C2B_VALIDATION_ACCEPT };
    }),
  },
  onParseError: (err, _req, res) => {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: err.message }));
  },
});

const port = Number(process.env.PORT) || 3000;
createServer(handler).listen(port, () => {
  console.log(`Callback server listening on http://localhost:${port}`);
  console.log("  POST /mpesa/stk       — STK Push callback");
  console.log("  POST /mpesa/c2b/confirm — C2B confirmation");
  console.log("  POST /mpesa/c2b/validate — C2B validation");
});
