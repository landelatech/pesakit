/**
 * Example: reverse a completed transaction.
 *
 * Run: node examples/reversal.mjs
 * Ensure .env has MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET,
 * MPESA_SHORT_CODE, MPESA_INITIATOR_NAME, and MPESA_SECURITY_CREDENTIAL.
 */

import "dotenv/config";
import { Mpesa } from "../dist/index.js";

const mpesa = new Mpesa({
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  environment: process.env.MPESA_ENVIRONMENT || "sandbox",
  shortCode: process.env.MPESA_SHORT_CODE,
  initiatorName: process.env.MPESA_INITIATOR_NAME,
  securityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
});

async function main() {
  const res = await mpesa.reversal.reverse({
    transactionId: "OEI2AK4Q16",
    amount: 100,
    resultUrl: "https://your-domain.com/mpesa/reversal/result",
    queueTimeOutUrl: "https://your-domain.com/mpesa/reversal/timeout",
    remarks: "Reverse duplicate debit",
    occasion: "Refund",
  });

  console.log("Reversal response:", res);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
