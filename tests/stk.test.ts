import { describe, it, expect, vi, beforeEach } from "vitest";
import { Mpesa } from "../src/index.js";
import { MpesaValidationError } from "../src/errors/index.js";

describe("Mpesa STK Push", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  const mockTokenFetch = () =>
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ access_token: "token", expires_in: "3599" })),
    } as Response);

  const mockStkPushSuccess = () =>
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      text: () =>
        Promise.resolve(
          JSON.stringify({
            MerchantRequestID: "m-id",
            CheckoutRequestID: "co-id",
            ResponseCode: "0",
            ResponseDescription: "Success",
            CustomerMessage: "Enter PIN",
          })
        ),
    } as Response);

  it("initiates STK push with valid input", async () => {
    mockTokenFetch();
    mockStkPushSuccess();

    const mpesa = new Mpesa({
      consumerKey: "key",
      consumerSecret: "secret",
      environment: "sandbox",
      shortCode: "174379",
      passKey: "pass",
    });

    const res = await mpesa.stkPush({
      phoneNumber: "254708374149",
      amount: 10,
      callbackUrl: "https://example.com/callback",
      accountReference: "ref",
      transactionDesc: "Payment",
    });

    expect(res.CheckoutRequestID).toBe("co-id");
    expect(res.ResponseCode).toBe("0");
    expect(res.timestamp).toBeDefined();
    expect(res.timestamp).toMatch(/^\d{14}$/);

    const postCall = vi.mocked(fetch).mock.calls.find((c) => c[1]?.method === "POST");
    expect(postCall).toBeDefined();
    const body = JSON.parse((postCall![1] as RequestInit).body as string);
    expect(body.BusinessShortCode).toBe("174379");
    expect(body.Amount).toBe(10);
    expect(body.PhoneNumber).toBe("254708374149");
    expect(body.CallBackURL).toBe("https://example.com/callback");
  });

  it("throws on invalid phone", async () => {
    const mpesa = new Mpesa({
      consumerKey: "key",
      consumerSecret: "secret",
      environment: "sandbox",
      shortCode: "174379",
      passKey: "pass",
    });

    await expect(
      mpesa.stkPush({
        phoneNumber: "invalid",
        amount: 10,
        callbackUrl: "https://example.com/cb",
        accountReference: "ref",
        transactionDesc: "Pay",
      })
    ).rejects.toThrow(MpesaValidationError);
  });

  it("throws on missing shortCode/passKey", async () => {
    const mpesa = new Mpesa({
      consumerKey: "key",
      consumerSecret: "secret",
      environment: "sandbox",
    });

    await expect(
      mpesa.stkPush({
        phoneNumber: "254708374149",
        amount: 10,
        callbackUrl: "https://example.com/cb",
        accountReference: "ref",
        transactionDesc: "Pay",
      })
    ).rejects.toThrow(MpesaValidationError);
  });
});

describe("Mpesa STK Query", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("queries STK status", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ access_token: "token", expires_in: "3599" })),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              ResponseCode: "0",
              ResponseDescription: "Success",
              MerchantRequestID: "m-id",
              CheckoutRequestID: "co-id",
              ResultCode: 0,
              ResultDesc: "Success",
            })
          ),
      } as Response);

    const mpesa = new Mpesa({
      consumerKey: "key",
      consumerSecret: "secret",
      environment: "sandbox",
      shortCode: "174379",
      passKey: "pass",
    });

    const res = await mpesa.stkQuery({ checkoutRequestId: "co-id" });
    expect(res.CheckoutRequestID).toBe("co-id");
    expect(res.ResultCode).toBe(0);
  });

  it("uses provided timestamp when querying", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ access_token: "token", expires_in: "3599" })),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              ResponseCode: "0",
              ResponseDescription: "Success",
              MerchantRequestID: "m-id",
              CheckoutRequestID: "co-id",
              ResultCode: 0,
              ResultDesc: "Success",
            })
          ),
      } as Response);

    const mpesa = new Mpesa({
      consumerKey: "key",
      consumerSecret: "secret",
      environment: "sandbox",
      shortCode: "174379",
      passKey: "pass",
    });

    await mpesa.stkQuery({
      checkoutRequestId: "co-id",
      timestamp: "20260201120000",
    });

    const postCall = vi.mocked(fetch).mock.calls.find((c) => c[1]?.method === "POST");
    expect(postCall).toBeDefined();
    const body = JSON.parse((postCall![1] as RequestInit).body as string);
    expect(body.Timestamp).toBe("20260201120000");
    expect(body.CheckoutRequestID).toBe("co-id");
  });
});
