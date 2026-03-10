/**
 * STK Push and STK Query request/response types.
 */

export type TransactionType = "CustomerPayBillOnline" | "CustomerBuyGoodsOnline";

export interface StkPushInput {
  /** Customer phone (254XXXXXXXXX). */
  phoneNumber: string;
  /** Amount to charge. */
  amount: number;
  /** Callback URL for result. */
  callbackUrl: string;
  /** Account reference (e.g. invoice number). */
  accountReference: string;
  /** Transaction description. */
  transactionDesc: string;
  /** Optional: shortcode override (defaults to config). */
  shortCode?: string;
  /** Optional: till = CustomerBuyGoodsOnline, paybill = CustomerPayBillOnline. */
  transactionType?: TransactionType;
}

export interface StkPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

/** STK Push response plus the timestamp used for the request. */
export type StkPushResult = StkPushResponse & {
  /** Timestamp used for this push (YYYYMMDDHHmmss). Useful for logging and deterministic tests. */
  timestamp: string;
};

export interface StkQueryInput {
  /** CheckoutRequestID from STK Push response. */
  checkoutRequestId: string;
  /** Optional timestamp override for deterministic testing or debugging. */
  timestamp?: string;
  /** Optional: shortcode override. */
  shortCode?: string;
}

export interface StkQueryResponse {
  ResponseCode: string;
  ResponseDescription: string;
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode?: number;
  ResultDesc?: string;
}

/** Public STK module surface exposed on `Mpesa`. */
export interface StkModule {
  push(input: StkPushInput): Promise<StkPushResult>;
  query(input: StkQueryInput): Promise<StkQueryResponse>;
}
