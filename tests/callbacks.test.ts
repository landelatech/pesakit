import { describe, it, expect } from "vitest";
import {
  parseStkPushCallback,
  getStkMetadata,
  parseC2BConfirmation,
  parseDarajaResult,
  getResultParametersMap,
  c2bValidationResponse,
  C2B_VALIDATION_ACCEPT,
  C2B_VALIDATION_REJECT,
  MpesaCallbackError,
} from "../src/callbacks/index.js";

describe("parseStkPushCallback", () => {
  it("parses successful STK callback", () => {
    const body = {
      Body: {
        stkCallback: {
          MerchantRequestID: "m-id",
          CheckoutRequestID: "co-id",
          ResultCode: 0,
          ResultDesc: "Success",
          CallbackMetadata: {
            Item: [
              { Name: "Amount", Value: 100 },
              { Name: "MpesaReceiptNumber", Value: "ABC123" },
              { Name: "TransactionDate", Value: "2023-04-26 12:30:00" },
              { Name: "PhoneNumber", Value: "254712345678" },
              { Name: "Balance", Value: 500 },
            ],
          },
        },
      },
    };
    const payload = parseStkPushCallback(body);
    expect(payload.ResultCode).toBe(0);
    expect(payload.CheckoutRequestID).toBe("co-id");
    expect(payload.CallbackMetadata?.Item).toHaveLength(5);

    const meta = getStkMetadata(payload);
    expect(meta).not.toBeNull();
    expect(meta!.amount).toBe(100);
    expect(meta!.mpesaReceiptNumber).toBe("ABC123");
    expect(meta!.phoneNumber).toBe("254712345678");
    expect(meta!.balance).toBe(500);
  });

  it("parses failed STK callback (no CallbackMetadata)", () => {
    const body = {
      Body: {
        stkCallback: {
          MerchantRequestID: "m-id",
          CheckoutRequestID: "co-id",
          ResultCode: 1032,
          ResultDesc: "Request cancelled by user",
        },
      },
    };
    const payload = parseStkPushCallback(body);
    expect(payload.ResultCode).toBe(1032);
    expect(payload.CallbackMetadata).toBeUndefined();
    expect(getStkMetadata(payload)).toBeNull();
  });

  it("throws MpesaCallbackError on invalid body", () => {
    expect(() => parseStkPushCallback({})).toThrow(MpesaCallbackError);
    expect(() => parseStkPushCallback(null)).toThrow(MpesaCallbackError);
  });
});

describe("parseC2BConfirmation", () => {
  it("parses C2B confirmation body", () => {
    const body = {
      TransactionType: "PayBill",
      TransID: "LK123",
      TransTime: "2023-08-23T14:30:00+03:00",
      TransAmount: "1000.00",
      BusinessShortCode: "123456",
      BillRefNumber: "ref-1",
      MSISDN: "254712345678",
    };
    const p = parseC2BConfirmation(body);
    expect(p.TransID).toBe("LK123");
    expect(p.TransAmount).toBe("1000.00");
    expect(p.MSISDN).toBe("254712345678");
    expect(p.BillRefNumber).toBe("ref-1");
  });
});

describe("C2B validation response", () => {
  it("C2B_VALIDATION_ACCEPT and REJECT have correct shape", () => {
    expect(C2B_VALIDATION_ACCEPT).toEqual({ ResultCode: 0, ResultDesc: "Accepted" });
    expect(C2B_VALIDATION_REJECT).toEqual({
      ResultCode: "C2B00016",
      ResultDesc: "Rejected",
    });
  });

  it("allows Daraja-style string rejection codes", () => {
    expect(c2bValidationResponse("C2B00011", "Rejected")).toEqual({
      ResultCode: "C2B00011",
      ResultDesc: "Rejected",
    });
  });
});

describe("parseDarajaResult and getResultParametersMap", () => {
  it("parses B2C/balance/status result and extracts parameters", () => {
    const body = {
      Result: {
        ResultCode: 0,
        ResultDesc: "Success",
        OriginatorConversationID: "orig",
        ConversationID: "conv",
        ResultParameters: {
          ResultParameter: [
            { Name: "Amount", Value: 500 },
            { Name: "MpesaReceiptNumber", Value: "XYZ" },
          ],
        },
      },
    };
    const payload = parseDarajaResult(body);
    expect(payload.Result.ResultCode).toBe(0);
    const map = getResultParametersMap(payload);
    expect(map.Amount).toBe(500);
    expect(map.MpesaReceiptNumber).toBe("XYZ");
  });
});
