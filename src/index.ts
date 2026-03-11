/**
 * @landelatech/pesakit
 *
 * Production-ready Node.js SDK for Safaricom M-Pesa Daraja APIs.
 * Fluent API, automatic OAuth, zero boilerplate.
 *
 * @example
 * ```ts
 * import { Mpesa } from "@landelatech/pesakit";
 *
 * const mpesa = new Mpesa({
 *   consumerKey: process.env.MPESA_CONSUMER_KEY!,
 *   consumerSecret: process.env.MPESA_CONSUMER_SECRET!,
 *   environment: "sandbox",
 *   shortCode: "174379",
 *   passKey: process.env.MPESA_PASS_KEY!,
 * });
 *
 * const res = await mpesa.stkPush({
 *   phoneNumber: "254708374149",
 *   amount: 10,
 *   callbackUrl: "https://example.com/callback",
 *   accountReference: "order-123",
 *   transactionDesc: "Payment",
 * });
 * console.log(res.CheckoutRequestID);
 * ```
 */

export { Mpesa } from "./clients/mpesa-client";
export type { MpesaConfig, ResolvedMpesaConfig } from "./config";
export type { Environment } from "./config";
export { MPESA_ENV_KEYS, resolveConfig } from "./config";
export {
  MpesaError,
  MpesaAuthError,
  MpesaRequestError,
  MpesaValidationError,
} from "./errors/index";

// Callbacks: typed payloads, parsers, and optional receiver
export {
  MpesaCallbackError,
  parseStkPushCallback,
  getStkMetadata,
  parseC2BConfirmation,
  parseC2BValidation,
  c2bValidationResponse,
  C2B_VALIDATION_ACCEPT,
  C2B_VALIDATION_REJECT,
  parseDarajaResult,
  getResultParametersMap,
  createCallbackHandler,
  stkPushRoute,
  c2BConfirmationRoute,
  c2BValidationRoute,
  darajaResultRoute,
} from "./callbacks/index";
export type {
  CallbackItem,
  StkPushCallbackPayload,
  StkPushSuccessMetadata,
  C2BConfirmationPayload,
  C2BValidationPayload,
  C2BValidationResponse,
  DarajaResultPayload,
  ResultParametersMap,
  CallbackRoute,
  CallbackResponseOverride,
  CreateCallbackHandlerOptions,
} from "./callbacks/index";

// Module input/output types for consumers
export type {
  StkPushInput,
  StkPushResponse,
  StkPushResult,
  StkQueryInput,
  StkQueryResponse,
} from "./modules/stk/types";
export type { StkModule, TransactionType } from "./modules/stk/types";
export type {
  C2BRegisterUrlsInput,
  C2BRegisterUrlsResponse,
  C2BSimulateInput,
  C2BSimulateResponse,
  C2BModule,
  ResponseType,
} from "./modules/c2b/types";
export type { B2CCommandId, B2CModule, B2CSendInput, B2CSendResponse } from "./modules/b2c/types";
export type {
  QrGenerateInput,
  QrGenerateResponse,
  QrModule,
  QrTransactionCode,
} from "./modules/qr/types";
export type {
  AccountBalanceInput,
  AccountBalanceResponse,
  AccountModule,
} from "./modules/account/types";
export type {
  TransactionModule,
  TransactionStatusInput,
  TransactionStatusResponse,
} from "./modules/transaction/types";
export type {
  ReversalCommandId,
  ReversalInput,
  ReversalModule,
  ReversalReceiverIdentifierType,
  ReversalResponse,
} from "./modules/reversal/types";
