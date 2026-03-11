/**
 * Parse and validate raw callback bodies into typed payloads.
 * Use in your POST handler: parseStkPushCallback(req.body) etc.
 */

import { MpesaError } from "../errors";
import type {
  StkPushCallbackPayload,
  StkPushSuccessMetadata,
  C2BConfirmationPayload,
  C2BValidationPayload,
  C2BValidationResponse,
  DarajaResultPayload,
  CallbackItem,
  ResultParametersMap,
} from "./types";

/** Thrown when callback body does not match expected shape. */
export class MpesaCallbackError extends MpesaError {
  constructor(message: string, options?: { responseBody?: unknown }) {
    super(message, { ...options, code: "MPESA_CALLBACK_ERROR" });
    this.name = "MpesaCallbackError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

function expectObject(value: unknown, path: string): Record<string, unknown> {
  if (value === null || value === undefined) {
    throw new MpesaCallbackError(`Missing or invalid callback body: ${path}`, {
      responseBody: value,
    });
  }
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new MpesaCallbackError(`Expected object at ${path}`, { responseBody: value });
  }
  return value as Record<string, unknown>;
}

function expectNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  throw new MpesaCallbackError("Expected number");
}

function expectString(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  throw new MpesaCallbackError("Expected string");
}

/**
 * Parse raw STK Push callback body (e.g. req.body) into a typed payload.
 * @throws MpesaCallbackError if body is invalid
 */
export function parseStkPushCallback(body: unknown): StkPushCallbackPayload {
  const root = expectObject(body, "body");
  const Body = expectObject(root.Body, "Body");
  const stkCallback = expectObject(Body.stkCallback, "Body.stkCallback");

  const ResultCode = expectNumber(stkCallback.ResultCode);
  const ResultDesc = expectString(stkCallback.ResultDesc);
  const MerchantRequestID = expectString(stkCallback.MerchantRequestID);
  const CheckoutRequestID = expectString(stkCallback.CheckoutRequestID);

  const result: StkPushCallbackPayload = {
    ResultCode,
    ResultDesc,
    MerchantRequestID,
    CheckoutRequestID,
  };

  if (stkCallback.CallbackMetadata && typeof stkCallback.CallbackMetadata === "object") {
    const meta = stkCallback.CallbackMetadata as { Item?: unknown };
    if (Array.isArray(meta.Item)) {
      result.CallbackMetadata = { Item: meta.Item as CallbackItem[] };
    }
  }

  return result;
}

/**
 * Extract a rich metadata object from a successful STK callback.
 * Use after parseStkPushCallback when ResultCode === 0 and CallbackMetadata is present.
 */
export function getStkMetadata(payload: StkPushCallbackPayload): StkPushSuccessMetadata | null {
  if (payload.ResultCode !== 0 || !payload.CallbackMetadata?.Item?.length) return null;

  const items = payload.CallbackMetadata.Item;
  const byName: Record<string, string | number> = {};
  for (const item of items) {
    if (item?.Name != null) byName[item.Name] = item.Value;
  }

  const amount = byName.Amount != null ? Number(byName.Amount) : NaN;
  const mpesaReceiptNumber = String(byName.MpesaReceiptNumber ?? "");
  const transactionDate = String(byName.TransactionDate ?? "");
  const phoneNumber = String(byName.PhoneNumber ?? "");
  const balance = byName.Balance != null ? Number(byName.Balance) : undefined;

  if (!Number.isFinite(amount) || !mpesaReceiptNumber || !transactionDate || !phoneNumber) {
    return null;
  }

  return {
    amount,
    mpesaReceiptNumber,
    transactionDate,
    phoneNumber,
    balance,
  };
}

/**
 * Parse raw C2B confirmation callback body.
 * @throws MpesaCallbackError if body is invalid
 */
export function parseC2BConfirmation(body: unknown): C2BConfirmationPayload {
  const o = expectObject(body, "body");
  return {
    TransactionType: expectString(o.TransactionType),
    TransID: expectString(o.TransID),
    TransTime: expectString(o.TransTime),
    TransAmount: expectString(o.TransAmount),
    BusinessShortCode: expectString(o.BusinessShortCode),
    BillRefNumber: expectString(o.BillRefNumber),
    InvoiceNumber: o.InvoiceNumber != null ? expectString(o.InvoiceNumber) : undefined,
    OrgAccountBalance: o.OrgAccountBalance != null ? expectString(o.OrgAccountBalance) : undefined,
    ThirdPartyTransID: o.ThirdPartyTransID != null ? expectString(o.ThirdPartyTransID) : undefined,
    MSISDN: expectString(o.MSISDN),
    FirstName: o.FirstName != null ? expectString(o.FirstName) : undefined,
    MiddleName: o.MiddleName != null ? expectString(o.MiddleName) : undefined,
    LastName: o.LastName != null ? expectString(o.LastName) : undefined,
  };
}

/**
 * Parse raw C2B validation callback body (before transaction completes).
 * @throws MpesaCallbackError if body is invalid
 */
export function parseC2BValidation(body: unknown): C2BValidationPayload {
  const o = expectObject(body, "body");
  return {
    TransactionType: expectString(o.TransactionType),
    TransID: expectString(o.TransID),
    TransTime: expectString(o.TransTime),
    TransAmount: expectString(o.TransAmount),
    BusinessShortCode: expectString(o.BusinessShortCode),
    BillRefNumber: expectString(o.BillRefNumber),
    InvoiceNumber: o.InvoiceNumber != null ? expectString(o.InvoiceNumber) : undefined,
    MSISDN: expectString(o.MSISDN),
    FirstName: o.FirstName != null ? expectString(o.FirstName) : undefined,
    MiddleName: o.MiddleName != null ? expectString(o.MiddleName) : undefined,
    LastName: o.LastName != null ? expectString(o.LastName) : undefined,
  };
}

/**
 * Build C2B validation response to accept or reject the transaction.
 * Return this JSON from your Validation URL handler.
 */
export function c2bValidationResponse(
  resultCode: number | string,
  resultDesc: string
): C2BValidationResponse {
  return { ResultCode: resultCode, ResultDesc: resultDesc };
}

/** Accept C2B validation (transaction will complete). */
export const C2B_VALIDATION_ACCEPT = c2bValidationResponse(0, "Accepted");
/** Reject C2B validation with Daraja's generic C2B error code. */
export const C2B_VALIDATION_REJECT = c2bValidationResponse("C2B00016", "Rejected");

/**
 * Parse raw B2C / Account Balance / Transaction Status result callback body.
 * @throws MpesaCallbackError if body is invalid
 */
export function parseDarajaResult(body: unknown): DarajaResultPayload {
  const root = expectObject(body, "body");
  const Result = expectObject(root.Result, "Result");
  const resultCode = expectNumber(Result.ResultCode);
  const resultDesc = expectString(Result.ResultDesc);
  const originatorConversationID = expectString(Result.OriginatorConversationID);
  const conversationID = expectString(Result.ConversationID);

  const resultInner: DarajaResultPayload["Result"] = {
    ResultCode: resultCode,
    ResultDesc: resultDesc,
    OriginatorConversationID: originatorConversationID,
    ConversationID: conversationID,
  };
  if (Result.ResultType != null) resultInner.ResultType = expectNumber(Result.ResultType);
  if (Result.TransactionID != null) resultInner.TransactionID = expectString(Result.TransactionID);
  if (Result.ResultParameters && typeof Result.ResultParameters === "object") {
    const rp = Result.ResultParameters as { ResultParameter?: unknown };
    if (Array.isArray(rp.ResultParameter)) {
      resultInner.ResultParameters = { ResultParameter: rp.ResultParameter as CallbackItem[] };
    }
  }
  if (Result.ReferenceData && typeof Result.ReferenceData === "object") {
    const rd = Result.ReferenceData as { ReferenceItem?: unknown };
    if (Array.isArray(rd.ReferenceItem)) {
      resultInner.ReferenceData = {
        ReferenceItem: rd.ReferenceItem as { Key: string; Value: string }[],
      };
    }
  }

  return { Result: resultInner };
}

/**
 * Get result parameters as a flat map (e.g. Amount, MpesaReceiptNumber, B2CUtilityAccountAvailableFunds).
 * Use after parseDarajaResult for B2C, account balance, or transaction status callbacks.
 */
export function getResultParametersMap(payload: DarajaResultPayload): ResultParametersMap {
  const params = payload.Result.ResultParameters?.ResultParameter;
  if (!params || !Array.isArray(params)) return {};
  const map: ResultParametersMap = {};
  for (const p of params) {
    if (p?.Name != null) map[p.Name] = p.Value;
  }
  return map;
}
