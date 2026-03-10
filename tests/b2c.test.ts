import { describe, it, expect, vi, beforeEach } from "vitest";
import { Mpesa } from "../src/index.js";
import { MpesaValidationError } from "../src/errors/index.js";

describe("Mpesa B2C", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  const mockToken = () =>
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ access_token: "token", expires_in: "3599" })),
    } as Response);

  const mockB2CSuccess = () =>
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      text: () =>
        Promise.resolve(
          JSON.stringify({
            ConversationID: "conv-1",
            OriginatorConversationID: "orig-1",
            ResponseCode: "0",
            ResponseDescription: "Accept the service request successfully.",
          })
        ),
    } as Response);

  const baseConfig = {
    consumerKey: "key",
    consumerSecret: "secret",
    environment: "sandbox" as const,
    shortCode: "600000",
    initiatorName: "testapi",
    securityCredential: "cred",
  };

  it("sends B2C payment with correct payload", async () => {
    mockToken();
    mockB2CSuccess();

    const mpesa = new Mpesa(baseConfig);
    const res = await mpesa.b2c.send({
      recipientPhone: "254712345678",
      amount: 500,
      resultUrl: "https://example.com/b2c/result",
      queueTimeOutUrl: "https://example.com/b2c/timeout",
      remarks: "Salary",
    });

    expect(res.ResponseCode).toBe("0");
    expect(res.ConversationID).toBe("conv-1");

    const postCall = vi.mocked(fetch).mock.calls.find((c) => c[1]?.method === "POST");
    expect(postCall).toBeDefined();
    const body = JSON.parse((postCall![1] as RequestInit).body as string);
    expect(body.InitiatorName).toBe("testapi");
    expect(body.SecurityCredential).toBe("cred");
    expect(body.Amount).toBe(500);
    expect(body.PartyA).toBe("600000");
    expect(body.PartyB).toBe("254712345678");
    expect(body.Remarks).toBe("Salary");
    expect(body.ResultURL).toBe("https://example.com/b2c/result");
    expect(body.QueueTimeOutURL).toBe("https://example.com/b2c/timeout");
  });

  it("uses default CommandID BusinessPayment when not specified", async () => {
    mockToken();
    mockB2CSuccess();

    const mpesa = new Mpesa(baseConfig);
    await mpesa.b2c.send({
      recipientPhone: "254712345678",
      amount: 100,
      resultUrl: "https://example.com/result",
      queueTimeOutUrl: "https://example.com/timeout",
      remarks: "Test",
    });

    const postCall = vi.mocked(fetch).mock.calls.find((c) => c[1]?.method === "POST");
    const body = JSON.parse((postCall![1] as RequestInit).body as string);
    expect(body.CommandID).toBe("BusinessPayment");
  });

  it("uses provided commandId", async () => {
    mockToken();
    mockB2CSuccess();

    const mpesa = new Mpesa(baseConfig);
    await mpesa.b2c.send({
      recipientPhone: "254712345678",
      amount: 100,
      resultUrl: "https://example.com/result",
      queueTimeOutUrl: "https://example.com/timeout",
      remarks: "Pay",
      commandId: "SalaryPayment",
    });

    const postCall = vi.mocked(fetch).mock.calls.find((c) => c[1]?.method === "POST");
    const body = JSON.parse((postCall![1] as RequestInit).body as string);
    expect(body.CommandID).toBe("SalaryPayment");
  });

  it("includes Occasion when provided", async () => {
    mockToken();
    mockB2CSuccess();

    const mpesa = new Mpesa(baseConfig);
    await mpesa.b2c.send({
      recipientPhone: "254712345678",
      amount: 200,
      resultUrl: "https://example.com/result",
      queueTimeOutUrl: "https://example.com/timeout",
      remarks: "Pay",
      occasion: "January 2024",
    });

    const postCall = vi.mocked(fetch).mock.calls.find((c) => c[1]?.method === "POST");
    const body = JSON.parse((postCall![1] as RequestInit).body as string);
    expect(body.Occasion).toBe("January 2024");
  });

  it("throws on invalid phone number", async () => {
    const mpesa = new Mpesa(baseConfig);
    await expect(
      mpesa.b2c.send({
        recipientPhone: "not-a-phone",
        amount: 100,
        resultUrl: "https://example.com/result",
        queueTimeOutUrl: "https://example.com/timeout",
        remarks: "Pay",
      })
    ).rejects.toThrow(MpesaValidationError);
  });

  it("throws on invalid resultUrl", async () => {
    const mpesa = new Mpesa(baseConfig);
    await expect(
      mpesa.b2c.send({
        recipientPhone: "254712345678",
        amount: 100,
        resultUrl: "not-a-url",
        queueTimeOutUrl: "https://example.com/timeout",
        remarks: "Pay",
      })
    ).rejects.toThrow(MpesaValidationError);
  });

  it("throws when initiatorName or securityCredential missing", async () => {
    const mpesa = new Mpesa({
      consumerKey: "key",
      consumerSecret: "secret",
      environment: "sandbox",
      shortCode: "600000",
    });
    await expect(
      mpesa.b2c.send({
        recipientPhone: "254712345678",
        amount: 100,
        resultUrl: "https://example.com/result",
        queueTimeOutUrl: "https://example.com/timeout",
        remarks: "Pay",
      })
    ).rejects.toThrow(MpesaValidationError);
  });
});
