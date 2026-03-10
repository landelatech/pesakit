import { beforeEach, describe, expect, it, vi } from "vitest";
import { Mpesa } from "../src/index.js";
import { MpesaValidationError } from "../src/errors/index.js";

describe("Mpesa Reversal", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  const mockToken = () =>
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ access_token: "token", expires_in: "3599" })),
    } as Response);

  const mockReversalSuccess = () =>
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      text: () =>
        Promise.resolve(
          JSON.stringify({
            ConversationID: "conv-reversal",
            OriginatorConversationID: "orig-reversal",
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

  it("requests a reversal with the expected payload", async () => {
    mockToken();
    mockReversalSuccess();

    const mpesa = new Mpesa(baseConfig);
    const res = await mpesa.reversal.reverse({
      transactionId: "OEI2AK4Q16",
      amount: 100,
      resultUrl: "https://example.com/reversal/result",
      queueTimeOutUrl: "https://example.com/reversal/timeout",
      remarks: "Reverse duplicate debit",
    });

    expect(res.ResponseCode).toBe("0");
    expect(res.ConversationID).toBe("conv-reversal");

    const postCall = vi.mocked(fetch).mock.calls.find((c) => c[1]?.method === "POST");
    const body = JSON.parse((postCall![1] as RequestInit).body as string);
    expect(body.CommandID).toBe("TransactionReversal");
    expect(body.TransactionID).toBe("OEI2AK4Q16");
    expect(body.Amount).toBe(100);
    expect(body.ReceiverParty).toBe("600000");
    expect(body.RecieverIdentifierType).toBe(4);
    expect(body.ResultURL).toBe("https://example.com/reversal/result");
    expect(body.QueueTimeOutURL).toBe("https://example.com/reversal/timeout");
    expect(body.Remarks).toBe("Reverse duplicate debit");
  });

  it("allows overriding receiver fields and occasion", async () => {
    mockToken();
    mockReversalSuccess();

    const mpesa = new Mpesa(baseConfig);
    await mpesa.reversal.reverse({
      transactionId: "OEI2AK4Q16",
      amount: 100,
      resultUrl: "https://example.com/reversal/result",
      queueTimeOutUrl: "https://example.com/reversal/timeout",
      remarks: "Reverse duplicate debit",
      occasion: "Refund",
      receiverParty: "600111",
      receiverIdentifierType: 11,
    });

    const postCall = vi.mocked(fetch).mock.calls.find((c) => c[1]?.method === "POST");
    const body = JSON.parse((postCall![1] as RequestInit).body as string);
    expect(body.ReceiverParty).toBe("600111");
    expect(body.RecieverIdentifierType).toBe(11);
    expect(body.Occasion).toBe("Refund");
  });

  it("throws on invalid callback URL", async () => {
    const mpesa = new Mpesa(baseConfig);

    await expect(
      mpesa.reversal.reverse({
        transactionId: "OEI2AK4Q16",
        amount: 100,
        resultUrl: "not-a-url",
        queueTimeOutUrl: "https://example.com/reversal/timeout",
        remarks: "Reverse duplicate debit",
      })
    ).rejects.toThrow(MpesaValidationError);
  });

  it("throws when initiatorName or securityCredential are missing", async () => {
    const mpesa = new Mpesa({
      consumerKey: "key",
      consumerSecret: "secret",
      environment: "sandbox",
      shortCode: "600000",
    });

    await expect(
      mpesa.reversal.reverse({
        transactionId: "OEI2AK4Q16",
        amount: 100,
        resultUrl: "https://example.com/reversal/result",
        queueTimeOutUrl: "https://example.com/reversal/timeout",
        remarks: "Reverse duplicate debit",
      })
    ).rejects.toThrow(MpesaValidationError);
  });
});
