/**
 * Reversal API types.
 */

export type ReversalCommandId = "TransactionReversal";

/**
 * Daraja commonly uses organization shortcode identifiers here.
 * Keep this open because portal examples vary across products and accounts.
 */
export type ReversalReceiverIdentifierType = number;

export interface ReversalInput {
  /** Original M-Pesa transaction ID to reverse. */
  transactionId: string;
  /** Amount to reverse. */
  amount: number;
  /** Result callback URL. */
  resultUrl: string;
  /** Timeout callback URL. */
  queueTimeOutUrl: string;
  /** Remarks sent with the reversal request. */
  remarks: string;
  /** Optional occasion or business context. */
  occasion?: string;
  /** Optional shortcode override. Defaults to configured shortcode. */
  shortCode?: string;
  /** Optional receiver party override. Defaults to the configured shortcode. */
  receiverParty?: string;
  /**
   * Optional receiver identifier type.
   * Common values are `4` for organization/shortcode and `1` for MSISDN.
   */
  receiverIdentifierType?: ReversalReceiverIdentifierType;
  /** Optional command ID override. Defaults to `TransactionReversal`. */
  commandId?: ReversalCommandId;
}

export interface ReversalResponse {
  ConversationID: string;
  OriginatorConversationID: string;
  ResponseCode: string;
  ResponseDescription: string;
}

/** Public reversal module surface exposed on `Mpesa`. */
export interface ReversalModule {
  reverse(input: ReversalInput): Promise<ReversalResponse>;
}
