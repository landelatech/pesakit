/**
 * B2C (Business to Customer) request/response types.
 */

export type B2CCommandId = "BusinessPayment" | "SalaryPayment" | "PromotionPayment";

export interface B2CSendInput {
  /** Recipient phone (254XXXXXXXXX). */
  recipientPhone: string;
  /** Amount to send. */
  amount: number;
  /** Result callback URL. */
  resultUrl: string;
  /** Timeout callback URL. */
  queueTimeOutUrl: string;
  /** Remarks (e.g. purpose of payment). */
  remarks: string;
  /** Optional occasion/reason. */
  occasion?: string;
  /** CommandID: BusinessPayment | SalaryPayment | PromotionPayment. */
  commandId?: B2CCommandId;
  /** Optional: shortcode override. */
  shortCode?: string;
}

export interface B2CSendResponse {
  ConversationID: string;
  OriginatorConversationID: string;
  ResponseCode: string;
  ResponseDescription: string;
}

/** Public B2C module surface exposed on `Mpesa`. */
export interface B2CModule {
  send(input: B2CSendInput): Promise<B2CSendResponse>;
}
