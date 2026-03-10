/**
 * Typed callback payloads for Daraja webhooks.
 * Use with parseStkPushCallback, parseC2BConfirmation, etc., or in your own routes.
 */

/** Name-value item in STK CallbackMetadata or Daraja ResultParameters. */
export interface CallbackItem {
  Name: string;
  Value: string | number;
}

/** STK Push (Lipa Na M-Pesa) callback – success or failure. */
export interface StkPushCallbackPayload {
  /** 0 = success; non-zero = failure (e.g. 1032 = cancelled by user). */
  ResultCode: number;
  ResultDesc: string;
  MerchantRequestID: string;
  CheckoutRequestID: string;
  /** Present only on success. */
  CallbackMetadata?: {
    Item: CallbackItem[];
  };
}

/** Parsed STK success metadata – use getStkMetadata() for a rich view. */
export interface StkPushSuccessMetadata {
  amount: number;
  mpesaReceiptNumber: string;
  transactionDate: string;
  phoneNumber: string;
  balance?: number;
}

/** C2B confirmation – sent to Confirmation URL when payment completes. */
export interface C2BConfirmationPayload {
  TransactionType: string;
  TransID: string;
  TransTime: string;
  TransAmount: string;
  BusinessShortCode: string;
  BillRefNumber: string;
  InvoiceNumber?: string;
  OrgAccountBalance?: string;
  ThirdPartyTransID?: string;
  MSISDN: string;
  FirstName?: string;
  MiddleName?: string;
  LastName?: string;
}

/** C2B validation – sent to Validation URL before completion; respond with Result. */
export interface C2BValidationPayload {
  TransactionType: string;
  TransID: string;
  TransTime: string;
  TransAmount: string;
  BusinessShortCode: string;
  BillRefNumber: string;
  InvoiceNumber?: string;
  MSISDN: string;
  FirstName?: string;
  MiddleName?: string;
  LastName?: string;
}

/** C2B validation response – return this JSON to accept or reject. */
export interface C2BValidationResponse {
  ResultCode: number;
  ResultDesc: string;
}

/** B2C / Account Balance / Transaction Status – Result wrapper (Daraja async result). */
export interface DarajaResultPayload {
  Result: {
    ResultType?: number;
    ResultCode: number;
    ResultDesc: string;
    OriginatorConversationID: string;
    ConversationID: string;
    TransactionID?: string;
    ResultParameters?: {
      ResultParameter: CallbackItem[];
    };
    ReferenceData?: {
      ReferenceItem: { Key: string; Value: string }[];
    };
  };
}

/** Parsed B2C/balance/status result parameters as a flat object by name. */
export type ResultParametersMap = Record<string, string | number>;
