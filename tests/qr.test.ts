import { beforeEach, describe, expect, it, vi } from "vitest";
import { Mpesa } from "../src/index.js";
import { MpesaValidationError } from "../src/errors/index.js";

describe("Mpesa Dynamic QR", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  const mockToken = () =>
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ access_token: "token", expires_in: "3599" })),
    } as Response);

  it("generates a dynamic QR code", async () => {
    mockToken();
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      text: () =>
        Promise.resolve(
          JSON.stringify({
            ResponseCode: "AG_20191219_000043fdf61864fe9ff5",
            RequestID: "16738-27456357-1",
            ResponseDescription: "QR Code Successfully Generated",
            QRCode: "iVBORw0KGgoAAAANSUhEUgAAASwAAAEs",
          })
        ),
    } as Response);

    const mpesa = new Mpesa({
      consumerKey: "key",
      consumerSecret: "secret",
      environment: "sandbox",
    });

    const res = await mpesa.qr.generate({
      merchantName: "TEST SUPERMARKET",
      refNo: "Invoice Test",
      amount: 1,
      trxCode: "BG",
      cpi: "373132",
      size: 300,
    });

    expect(res.ResponseDescription).toBe("QR Code Successfully Generated");

    const postCall = vi.mocked(fetch).mock.calls.find((c) => c[1]?.method === "POST");
    const body = JSON.parse((postCall![1] as RequestInit).body as string);
    expect(body).toEqual({
      MerchantName: "TEST SUPERMARKET",
      RefNo: "Invoice Test",
      Amount: 1,
      TrxCode: "BG",
      CPI: "373132",
      Size: "300",
    });
  });

  it("throws on invalid trxCode", async () => {
    const mpesa = new Mpesa({
      consumerKey: "key",
      consumerSecret: "secret",
      environment: "sandbox",
    });

    await expect(
      mpesa.qr.generate({
        merchantName: "TEST SUPERMARKET",
        refNo: "Invoice Test",
        amount: 1,
        trxCode: "XX" as "BG",
        cpi: "373132",
        size: 300,
      })
    ).rejects.toThrow(MpesaValidationError);
  });

  it("throws on invalid size", async () => {
    const mpesa = new Mpesa({
      consumerKey: "key",
      consumerSecret: "secret",
      environment: "sandbox",
    });

    await expect(
      mpesa.qr.generate({
        merchantName: "TEST SUPERMARKET",
        refNo: "Invoice Test",
        amount: 1,
        trxCode: "BG",
        cpi: "373132",
        size: "zero",
      })
    ).rejects.toThrow(MpesaValidationError);
  });
});
