import { describe, it, expect, vi, beforeEach } from "vitest";
import { Mpesa } from "../src/index.js";
import { MpesaValidationError } from "../src/errors/index.js";

describe("Mpesa C2B", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  const mockToken = () =>
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ access_token: "token", expires_in: "3599" })),
    } as Response);

  it("registers URLs", async () => {
    mockToken();
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      text: () =>
        Promise.resolve(
          JSON.stringify({
            ConversationID: "conv",
            OriginatorCoversationID: "orig",
            ResponseDescription: "success",
          })
        ),
    } as Response);

    const mpesa = new Mpesa({
      consumerKey: "key",
      consumerSecret: "secret",
      environment: "sandbox",
      shortCode: "601426",
    });

    const res = await mpesa.c2b.registerUrls({
      confirmationUrl: "https://example.com/confirm",
      validationUrl: "https://example.com/validate",
    });

    expect(res.ResponseDescription).toBe("success");
    expect(res.OriginatorConversationID).toBe("orig");

    const postCall = vi.mocked(fetch).mock.calls.find((c) => c[1]?.method === "POST");
    const body = JSON.parse((postCall![1] as RequestInit).body as string);
    expect(body.ShortCode).toBe("601426");
    expect(body.ConfirmationURL).toBe("https://example.com/confirm");
    expect(body.ValidationURL).toBe("https://example.com/validate");
  });

  it("simulates C2B payment", async () => {
    mockToken();
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      text: () =>
        Promise.resolve(
          JSON.stringify({
            ConversationID: "c",
            OriginatorConversationID: "o",
            ResponseDescription: "Accepted",
          })
        ),
    } as Response);

    const mpesa = new Mpesa({
      consumerKey: "key",
      consumerSecret: "secret",
      environment: "sandbox",
      shortCode: "601426",
    });

    const res = await mpesa.c2b.simulate({
      amount: 100,
      msisdn: "254712345678",
      billRefNumber: "inv-1",
    });

    expect(res.ResponseDescription).toBe("Accepted");

    const postCall = vi.mocked(fetch).mock.calls.find((c) => c[1]?.method === "POST");
    const body = JSON.parse((postCall![1] as RequestInit).body as string);
    expect(body.Amount).toBe(100);
    expect(body.Msisdn).toBe("254712345678");
    expect(body.BillRefNumber).toBe("inv-1");
  });

  it("throws on invalid URL for registerUrls", async () => {
    const mpesa = new Mpesa({
      consumerKey: "key",
      consumerSecret: "secret",
      environment: "sandbox",
      shortCode: "601426",
    });

    await expect(
      mpesa.c2b.registerUrls({
        confirmationUrl: "not-a-url",
        validationUrl: "https://example.com/v",
      })
    ).rejects.toThrow(MpesaValidationError);
  });

  it("throws when simulate is used in production", async () => {
    const mpesa = new Mpesa({
      consumerKey: "key",
      consumerSecret: "secret",
      environment: "production",
      shortCode: "601426",
    });

    await expect(
      mpesa.c2b.simulate({
        amount: 100,
        msisdn: "254712345678",
      })
    ).rejects.toThrow(/sandbox environment/);
  });
});
