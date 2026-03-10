/**
 * C2B (Customer to Business) request/response types.
 */

export type ResponseType = "Completed" | "Cancelled";

export interface C2BRegisterUrlsInput {
  /** Confirmation URL – receives POST with completed transaction data. */
  confirmationUrl: string;
  /** Validation URL – receives POST before transaction completes (optional logic). */
  validationUrl: string;
  /** Default when validation endpoint is unreachable: Completed | Cancelled. */
  responseType?: ResponseType;
  /** Optional: shortcode override. */
  shortCode?: string;
}

export interface C2BRegisterUrlsResponse {
  ConversationID: string;
  OriginatorConversationID: string;
  ResponseDescription: string;
}

export interface C2BSimulateInput {
  /** Amount. */
  amount: number;
  /** Customer phone (254XXXXXXXXX). */
  msisdn: string;
  /** Optional bill reference. */
  billRefNumber?: string;
  /** Optional: shortcode override. */
  shortCode?: string;
  /** CommandID: CustomerPayBillOnline or CustomerBuyGoodsOnline. */
  commandId?: "CustomerPayBillOnline" | "CustomerBuyGoodsOnline";
}

export interface C2BSimulateResponse {
  ConversationID: string;
  OriginatorConversationID: string;
  ResponseDescription: string;
}

/** Public C2B module surface exposed on `Mpesa`. */
export interface C2BModule {
  registerUrls(input: C2BRegisterUrlsInput): Promise<C2BRegisterUrlsResponse>;
  simulate(input: C2BSimulateInput): Promise<C2BSimulateResponse>;
}
