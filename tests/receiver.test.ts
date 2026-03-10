import { describe, expect, it, vi } from "vitest";
import type { IncomingMessage, ServerResponse } from "node:http";
import { EventEmitter } from "node:events";
import {
  C2B_VALIDATION_ACCEPT,
  C2B_VALIDATION_REJECT,
  c2BConfirmationRoute,
  c2BValidationRoute,
  createCallbackHandler,
  darajaResultRoute,
  getStkMetadata,
  MpesaCallbackError,
  parseC2BValidation,
  stkPushRoute,
} from "../src";

// --- Helpers ---

function makeReq(method: string, url: string, body: unknown): IncomingMessage {
  const emitter = new EventEmitter() as IncomingMessage;
  (emitter as unknown as Record<string, unknown>).method = method;
  (emitter as unknown as Record<string, unknown>).url = url;
  setImmediate(() => {
    emitter.emit("data", Buffer.from(JSON.stringify(body)));
    emitter.emit("end");
  });
  return emitter;
}

function makeRes(): { res: ServerResponse; status: () => number; body: () => string } {
  let statusCode = 200;
  const chunks: string[] = [];
  const res = {
    statusCode,
    setHeader: vi.fn(),
    end: (chunk: string) => chunks.push(chunk),
  } as unknown as ServerResponse;
  Object.defineProperty(res, "statusCode", {
    get: () => statusCode,
    set: (v) => {
      statusCode = v;
    },
  });
  return {
    res,
    status: () => statusCode,
    body: () => chunks.join(""),
  };
}

const stkSuccessBody = {
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
          { Name: "TransactionDate", Value: "20240101120000" },
          { Name: "PhoneNumber", Value: "254712345678" },
        ],
      },
    },
  },
};

const c2bConfirmBody = {
  TransactionType: "PayBill",
  TransID: "LK123",
  TransTime: "2024-01-01T12:00:00+03:00",
  TransAmount: "500.00",
  BusinessShortCode: "601426",
  BillRefNumber: "ref-1",
  MSISDN: "254712345678",
};

// --- Tests ---

describe("createCallbackHandler", () => {
  it("dispatches STK callback to handler and responds 200", async () => {
    const handler = vi.fn();
    const callbackHandler = createCallbackHandler({
      routes: { "/stk": stkPushRoute(handler) },
    });

    const { res, status } = makeRes();
    await callbackHandler(makeReq("POST", "/stk", stkSuccessBody), res);

    expect(handler).toHaveBeenCalledOnce();
    const payload = handler.mock.calls[0][0];
    expect(payload.ResultCode).toBe(0);
    expect(payload.CheckoutRequestID).toBe("co-id");
    expect(status()).toBe(200);
  });

  it("passes typed STK payload and getStkMetadata works", async () => {
    let capturedMeta: ReturnType<typeof getStkMetadata> = null;
    const callbackHandler = createCallbackHandler({
      routes: {
        "/stk": stkPushRoute((payload) => {
          capturedMeta = getStkMetadata(payload);
        }),
      },
    });

    const { res } = makeRes();
    await callbackHandler(makeReq("POST", "/stk", stkSuccessBody), res);

    expect(capturedMeta).not.toBeNull();
    expect(capturedMeta!.amount).toBe(100);
    expect(capturedMeta!.mpesaReceiptNumber).toBe("ABC123");
    expect(capturedMeta!.phoneNumber).toBe("254712345678");
  });

  it("dispatches C2B confirmation callback", async () => {
    const handler = vi.fn();
    const callbackHandler = createCallbackHandler({
      routes: { "/c2b/confirm": c2BConfirmationRoute(handler) },
    });

    const { res, status } = makeRes();
    await callbackHandler(makeReq("POST", "/c2b/confirm", c2bConfirmBody), res);

    expect(handler).toHaveBeenCalledOnce();
    const payload = handler.mock.calls[0][0];
    expect(payload.TransID).toBe("LK123");
    expect(payload.TransAmount).toBe("500.00");
    expect(payload.MSISDN).toBe("254712345678");
    expect(status()).toBe(200);
  });

  it("allows C2B validation handler to return accept/reject override", async () => {
    const callbackHandler = createCallbackHandler({
      routes: {
        "/c2b/validate": c2BValidationRoute((_payload) => ({
          statusCode: 200,
          body: C2B_VALIDATION_REJECT,
        })),
      },
    });

    const { res, status, body } = makeRes();
    await callbackHandler(makeReq("POST", "/c2b/validate", c2bConfirmBody), res);

    expect(status()).toBe(200);
    expect(JSON.parse(body())).toEqual(C2B_VALIDATION_REJECT);
  });

  it("allows C2B validation handler to accept", async () => {
    const callbackHandler = createCallbackHandler({
      routes: {
        "/c2b/validate": c2BValidationRoute(() => ({
          statusCode: 200,
          body: C2B_VALIDATION_ACCEPT,
        })),
      },
    });

    const { res, body } = makeRes();
    await callbackHandler(makeReq("POST", "/c2b/validate", c2bConfirmBody), res);

    expect(JSON.parse(body())).toEqual(C2B_VALIDATION_ACCEPT);
  });

  it("dispatches darajaResultRoute for B2C/balance/status result", async () => {
    const handler = vi.fn();
    const resultBody = {
      Result: {
        ResultCode: 0,
        ResultDesc: "Success",
        OriginatorConversationID: "orig",
        ConversationID: "conv",
        ResultParameters: {
          ResultParameter: [{ Name: "Amount", Value: 500 }],
        },
      },
    };

    const callbackHandler = createCallbackHandler({
      routes: { "/result": darajaResultRoute(handler) },
    });

    const { res, status } = makeRes();
    await callbackHandler(makeReq("POST", "/result", resultBody), res);

    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0].Result.ResultCode).toBe(0);
    expect(status()).toBe(200);
  });

  it("returns 404 for unknown route", async () => {
    const callbackHandler = createCallbackHandler({ routes: {} });
    const { res, status } = makeRes();
    await callbackHandler(makeReq("POST", "/unknown", {}), res);
    expect(status()).toBe(404);
  });

  it("returns 404 for non-POST request", async () => {
    const callbackHandler = createCallbackHandler({
      routes: { "/stk": stkPushRoute(vi.fn()) },
    });
    const { res, status } = makeRes();
    await callbackHandler(makeReq("GET", "/stk", {}), res);
    expect(status()).toBe(404);
  });

  it("returns 400 on invalid callback body", async () => {
    const callbackHandler = createCallbackHandler({
      routes: { "/stk": stkPushRoute(vi.fn()) },
    });
    const { res, status } = makeRes();
    await callbackHandler(makeReq("POST", "/stk", {}), res);
    expect(status()).toBe(400);
  });

  it("calls onParseError when provided and body is invalid", async () => {
    const onParseError = vi.fn((_err, _req, res: ServerResponse) => {
      res.statusCode = 422;
      res.end("custom error");
    });

    const callbackHandler = createCallbackHandler({
      routes: { "/stk": stkPushRoute(vi.fn()) },
      onParseError,
    });

    const { res, status } = makeRes();
    await callbackHandler(makeReq("POST", "/stk", {}), res);

    expect(onParseError).toHaveBeenCalledOnce();
    expect(onParseError.mock.calls[0][0]).toBeInstanceOf(MpesaCallbackError);
    expect(status()).toBe(422);
  });

  it("calls onNotFound when provided and route not matched", async () => {
    const onNotFound = vi.fn((_req, res: ServerResponse) => {
      res.statusCode = 404;
      res.end("nope");
    });

    const callbackHandler = createCallbackHandler({ routes: {}, onNotFound });
    const { res } = makeRes();
    await callbackHandler(makeReq("POST", "/missing", {}), res);

    expect(onNotFound).toHaveBeenCalledOnce();
  });

  it("uses custom successStatus and successBody", async () => {
    const callbackHandler = createCallbackHandler({
      routes: { "/stk": stkPushRoute(vi.fn()) },
      successStatus: 201,
      successBody: { ok: true },
    });

    const { res, status, body } = makeRes();
    await callbackHandler(makeReq("POST", "/stk", stkSuccessBody), res);

    expect(status()).toBe(201);
    expect(JSON.parse(body())).toEqual({ ok: true });
  });

  it("returns 500 when handler throws", async () => {
    const callbackHandler = createCallbackHandler({
      routes: {
        "/stk": stkPushRoute(() => {
          throw new Error("handler error");
        }),
      },
    });

    const { res, status } = makeRes();
    await callbackHandler(makeReq("POST", "/stk", stkSuccessBody), res);
    expect(status()).toBe(500);
  });

  it("strips query string when matching route", async () => {
    const handler = vi.fn();
    const callbackHandler = createCallbackHandler({
      routes: { "/stk": stkPushRoute(handler) },
    });

    const { res } = makeRes();
    await callbackHandler(makeReq("POST", "/stk?foo=bar", stkSuccessBody), res);

    expect(handler).toHaveBeenCalledOnce();
  });
});

describe("parseC2BValidation", () => {
  it("parses C2B validation body", () => {
    const body = {
      TransactionType: "PayBill",
      TransID: "LK999",
      TransTime: "2024-01-01T12:00:00+03:00",
      TransAmount: "250.00",
      BusinessShortCode: "601426",
      BillRefNumber: "ref-valid",
      MSISDN: "254712345678",
      FirstName: "John",
    };
    const p = parseC2BValidation(body);
    expect(p.TransID).toBe("LK999");
    expect(p.TransAmount).toBe("250.00");
    expect(p.BillRefNumber).toBe("ref-valid");
    expect(p.FirstName).toBe("John");
    expect(p.MSISDN).toBe("254712345678");
  });

  it("throws MpesaCallbackError on invalid body", () => {
    expect(() => parseC2BValidation(null)).toThrow(MpesaCallbackError);
    expect(() => parseC2BValidation({})).toThrow(MpesaCallbackError);
  });
});
