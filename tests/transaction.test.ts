import { describe, it, expect, vi, beforeEach } from "vitest";
import { Mpesa } from "../src/index.js";
import { MpesaValidationError } from "../src/errors/index.js";

describe("Mpesa Transaction Status", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  const mockToken = () =>
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ access_token: "token", expires_in: "3599" })),
    } as Response);

  const mockStatusSuccess = () =>
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      text: () =>
        Promise.resolve(
          JSON.stringify({
            ConversationID: "conv-status",
            OriginatorConversationID: "orig-status",
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

  it("queries transaction status with correct payload", async () => {
    mockToken();
    mockStatusSuccess();

    const mpesa = new Mpesa(baseConfig);
    const res = await mpesa.transaction.status({
      transactionId: "ABC123XYZ",
      resultUrl: "https://example.com/status/result",
      queueTimeOutUrl: "https://example.com/status/timeout",
      remarks: "Status check",
    });

    expect(res.ResponseCode).toBe("0");
    expect(res.ConversationID).toBe("conv-status");

    const postCall = vi.mocked(fetch).mock.calls.find((c) => c[1]?.method === "POST");
    expect(postCall).toBeDefined();
    const body = JSON.parse((postCall![1] as RequestInit).body as string);
    expect(body.CommandID).toBe("TransactionStatusQuery");
    expect(body.TransactionID).toBe("ABC123XYZ");
    expect(body.Initiator).toBe("testapi");
    expect(body.SecurityCredential).toBe("cred");
    expect(body.PartyA).toBe("600000");
    expect(body.IdentifierType).toBe(4);
    expect(body.ResultURL).toBe("https://example.com/status/result");
    expect(body.QueueTimeOutURL).toBe("https://example.com/status/timeout");
    expect(body.Remarks).toBe("Status check");
  });

  it("throws on empty transactionId", async () => {
    const mpesa = new Mpesa(baseConfig);
    await expect(
      mpesa.transaction.status({
        transactionId: "",
        resultUrl: "https://example.com/result",
        queueTimeOutUrl: "https://example.com/timeout",
        remarks: "Check",
      })
    ).rejects.toThrow(MpesaValidationError);
  });

  it("includes occasion when provided", async () => {
    mockToken();
    mockStatusSuccess();

    const mpesa = new Mpesa(baseConfig);
    await mpesa.transaction.status({
      transactionId: "ABC123XYZ",
      resultUrl: "https://example.com/status/result",
      queueTimeOutUrl: "https://example.com/status/timeout",
      remarks: "Status check",
      occasion: "Order reconciliation",
    });

    const postCall = vi.mocked(fetch).mock.calls.find((c) => c[1]?.method === "POST");
    const body = JSON.parse((postCall![1] as RequestInit).body as string);
    expect(body.Occasion).toBe("Order reconciliation");
  });

  it("throws on invalid resultUrl", async () => {
    const mpesa = new Mpesa(baseConfig);
    await expect(
      mpesa.transaction.status({
        transactionId: "TXN123",
        resultUrl: "not-a-url",
        queueTimeOutUrl: "https://example.com/timeout",
        remarks: "Check",
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
      mpesa.transaction.status({
        transactionId: "TXN123",
        resultUrl: "https://example.com/result",
        queueTimeOutUrl: "https://example.com/timeout",
        remarks: "Check",
      })
    ).rejects.toThrow(MpesaValidationError);
  });
});
