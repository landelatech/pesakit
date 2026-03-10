/**
 * Optional callback receiver: parse incoming Daraja POST bodies and dispatch to typed handlers.
 * Use with Node's http.createServer or mount in your app (Express, Fastify, etc.).
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import { parseStkPushCallback } from "./parsers";
import type { StkPushCallbackPayload } from "./types";
import type { C2BConfirmationPayload, C2BValidationPayload, DarajaResultPayload } from "./types";
import { parseC2BConfirmation, parseC2BValidation, parseDarajaResult } from "./parsers";
import { MpesaCallbackError } from "./parsers";

export type {
  StkPushCallbackPayload,
  C2BConfirmationPayload,
  C2BValidationPayload,
  DarajaResultPayload,
};

type HttpHandler = (req: IncomingMessage, res: ServerResponse) => void | Promise<void>;

/** Optional response override from handler (e.g. C2B validation must return ResultCode/ResultDesc). */
export interface CallbackResponseOverride {
  statusCode?: number;
  body?: string | Record<string, unknown>;
}

/** Route config: parser + handler. Handler receives typed payload; can return void or override response. */
export interface CallbackRoute<T> {
  parse: (body: unknown) => T;
  handler: (
    payload: T
  ) => void | Promise<void> | CallbackResponseOverride | Promise<CallbackResponseOverride>;
}

export interface CreateCallbackHandlerOptions {
  /** Path -> route. Path should match req.url pathname (e.g. "/mpesa/stk"). */
  routes: Record<string, CallbackRoute<unknown>>;
  /** Status code for successful handling (default 200). */
  successStatus?: number;
  /** Body sent on success (default "OK"). Can be string or object (sent as JSON). */
  successBody?: string | Record<string, unknown>;
  /** Called when body parse fails; can send custom response (default: 400 + error message). */
  onParseError?: (err: MpesaCallbackError, req: IncomingMessage, res: ServerResponse) => void;
  /** Called when no route matches (default: 404). */
  onNotFound?: (req: IncomingMessage, res: ServerResponse) => void;
}

function getPathname(url: string): string {
  const q = url.indexOf("?");
  return q === -1 ? url : url.slice(0, q);
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function send(res: ServerResponse, status: number, body: string | Record<string, unknown>): void {
  res.statusCode = status;
  const isObj = typeof body === "object";
  if (isObj) {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(body));
  } else {
    res.setHeader("Content-Type", "text/plain");
    res.end(body);
  }
}

function isResponseOverride(value: unknown): value is CallbackResponseOverride {
  return value != null && typeof value === "object" && ("statusCode" in value || "body" in value);
}

/**
 * Create an HTTP request handler that receives Daraja callbacks, parses the body, and calls your typed handler.
 * Use with Node's http.createServer(handler) or mount in your framework.
 *
 * @example
 * ```ts
 * const handler = createCallbackHandler({
 *   routes: {
 *     "/mpesa/stk": {
 *       parse: parseStkPushCallback,
 *       handler: async (payload) => {
 *         if (payload.ResultCode === 0) {
 *           const meta = getStkMetadata(payload);
 *           if (meta) console.log(meta.mpesaReceiptNumber, meta.amount);
 *         }
 *       },
 *     },
 *     "/mpesa/c2b/confirm": {
 *       parse: parseC2BConfirmation,
 *       handler: (p) => console.log(p.TransID, p.TransAmount),
 *     },
 *   },
 * });
 * import { createServer } from "node:http";
 * createServer(handler).listen(3000);
 * ```
 */
export function createCallbackHandler(options: CreateCallbackHandlerOptions): HttpHandler {
  const { routes, successStatus = 200, successBody = "OK", onParseError, onNotFound } = options;

  return async function callbackHandler(req: IncomingMessage, res: ServerResponse): Promise<void> {
    if (req.method !== "POST") {
      if (onNotFound) onNotFound(req, res);
      else send(res, 404, "Not Found");
      return;
    }

    const pathname = getPathname(req.url ?? "");
    const route = routes[pathname];
    if (!route) {
      if (onNotFound) onNotFound(req, res);
      else send(res, 404, "Not Found");
      return;
    }

    let raw: unknown;
    try {
      const text = await readBody(req);
      raw = text ? JSON.parse(text) : undefined;
    } catch {
      if (onParseError) {
        onParseError(
          new MpesaCallbackError("Invalid JSON body", { responseBody: undefined }),
          req,
          res
        );
      } else {
        send(res, 400, "Bad Request: invalid JSON");
      }
      return;
    }

    let payload: unknown;
    try {
      payload = route.parse(raw);
    } catch (err) {
      if (onParseError && err instanceof MpesaCallbackError) {
        onParseError(err, req, res);
      } else if (err instanceof MpesaCallbackError) {
        send(res, 400, { error: err.message });
      } else {
        send(res, 400, "Bad Request: invalid callback body");
      }
      return;
    }

    try {
      const result = await route.handler(payload);
      if (isResponseOverride(result)) {
        send(res, result.statusCode ?? successStatus, result.body ?? successBody);
      } else {
        send(res, successStatus, successBody);
      }
    } catch {
      res.statusCode = 500;
      res.setHeader("Content-Type", "text/plain");
      res.end("Internal Server Error");
    }
  };
}

/** Predefined route for STK Push callback. */
export function stkPushRoute(
  handler: (payload: StkPushCallbackPayload) => void | Promise<void>
): CallbackRoute<StkPushCallbackPayload> {
  return { parse: parseStkPushCallback, handler };
}

/** Predefined route for C2B confirmation. */
export function c2BConfirmationRoute(
  handler: (payload: C2BConfirmationPayload) => void | Promise<void>
): CallbackRoute<C2BConfirmationPayload> {
  return { parse: parseC2BConfirmation, handler };
}

/** Predefined route for C2B validation. Return C2B_VALIDATION_ACCEPT or C2B_VALIDATION_REJECT (or a custom { statusCode, body }) so Daraja gets the correct JSON. */
export function c2BValidationRoute(
  handler: (
    payload: C2BValidationPayload
  ) => void | Promise<void> | CallbackResponseOverride | Promise<CallbackResponseOverride>
): CallbackRoute<C2BValidationPayload> {
  return { parse: parseC2BValidation, handler };
}

/** Predefined route for B2C / Account Balance / Transaction Status result callback. */
export function darajaResultRoute(
  handler: (payload: DarajaResultPayload) => void | Promise<void>
): CallbackRoute<DarajaResultPayload> {
  return { parse: parseDarajaResult, handler };
}
