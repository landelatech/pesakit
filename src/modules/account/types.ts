/**
 * Account Balance API types.
 */

export interface AccountBalanceInput {
  /** Result callback URL. */
  resultUrl: string;
  /** Timeout callback URL. */
  queueTimeOutUrl: string;
  /** Optional remarks sent with the request. Defaults to `Account balance query`. */
  remarks?: string;
  /** Optional: shortcode override. */
  shortCode?: string;
  /** Identifier type: 1=MSISDN, 2=TILL, 4=ORGANIZATION (shortcode). Default 4. */
  identifierType?: 1 | 2 | 4;
}

export interface AccountBalanceResponse {
  ConversationID: string;
  OriginatorConversationID: string;
  ResponseCode: string;
  ResponseDescription: string;
}

/** Public account module surface exposed on `Mpesa`. */
export interface AccountModule {
  balance(input: AccountBalanceInput): Promise<AccountBalanceResponse>;
}
