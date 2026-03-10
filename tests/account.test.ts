import { describe, it, expect, vi, beforeEach } from "vitest";
import { Mpesa } from "../src/index.js";
import { MpesaValidationError } from "../src/errors/index.js";

describe("Mpesa Account Balance", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  const mockToken = () =>
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ access_token: "token", expires_in: "3599" })),
    } as Response);

  const mockBalanceSuccess = () =>
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      text: () =>
        Promise.resolve(
          JSON.stringify({
            ConversationID: "conv-bal",
            OriginatorConversationID: "orig-bal",
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

  it("requests account balance with correct payload", async () => {
    mockToken();
    mockBalanceSuccess();

    const mpesa = new Mpesa(baseConfig);
    const res = await mpesa.account.balance({
      resultUrl: "https://example.com/balance/result",
      queueTimeOutUrl: "https://example.com/balance/timeout",
    });

    expect(res.ResponseCode).toBe("0");
    expect(res.ConversationID).toBe("conv-bal");

    const postCall = vi.mocked(fetch).mock.calls.find((c) => c[1]?.method === "POST");
    expect(postCall).toBeDefined();
    const body = JSON.parse((postCall![1] as RequestInit).body as string);
    expect(body.CommandID).toBe("AccountBalance");
    expect(body.Initiator).toBe("testapi");
    expect(body.SecurityCredential).toBe("cred");
    expect(body.PartyA).toBe("600000");
    expect(body.IdentifierType).toBe(4);
    expect(body.ResultURL).toBe("https://example.com/balance/result");
    expect(body.QueueTimeOutURL).toBe("https://example.com/balance/timeout");
    expect(body.Remarks).toBe("Account balance query");
  });

  it("uses identifierType from input when provided", async () => {
    mockToken();
    mockBalanceSuccess();

    const mpesa = new Mpesa(baseConfig);
    await mpesa.account.balance({
      resultUrl: "https://example.com/result",
      queueTimeOutUrl: "https://example.com/timeout",
      identifierType: 2,
    });

    const postCall = vi.mocked(fetch).mock.calls.find((c) => c[1]?.method === "POST");
    const body = JSON.parse((postCall![1] as RequestInit).body as string);
    expect(body.IdentifierType).toBe(2);
  });

  it("uses provided remarks when set", async () => {
    mockToken();
    mockBalanceSuccess();

    const mpesa = new Mpesa(baseConfig);
    await mpesa.account.balance({
      resultUrl: "https://example.com/result",
      queueTimeOutUrl: "https://example.com/timeout",
      remarks: "Daily reconciliation",
    });

    const postCall = vi.mocked(fetch).mock.calls.find((c) => c[1]?.method === "POST");
    const body = JSON.parse((postCall![1] as RequestInit).body as string);
    expect(body.Remarks).toBe("Daily reconciliation");
  });

  it("throws on invalid resultUrl", async () => {
    const mpesa = new Mpesa(baseConfig);
    await expect(
      mpesa.account.balance({
        resultUrl: "not-a-url",
        queueTimeOutUrl: "https://example.com/timeout",
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
      mpesa.account.balance({
        resultUrl: "https://example.com/result",
        queueTimeOutUrl: "https://example.com/timeout",
      })
    ).rejects.toThrow(MpesaValidationError);
  });
});
