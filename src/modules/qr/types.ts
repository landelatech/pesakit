/**
 * Dynamic QR request/response types.
 */

export type QrTransactionCode = "BG" | "WA" | "PB" | "SM" | "SB";

export interface QrGenerateInput {
  /** Merchant name shown for the QR payment. */
  merchantName: string;
  /** Transaction reference shown to the user or merchant. */
  refNo: string;
  /** Amount to embed in the QR code. */
  amount: number;
  /** Transaction type: buy goods, withdraw, paybill, send money, or send to business. */
  trxCode: QrTransactionCode;
  /** Credit Party Identifier: shortcode, till, paybill, business number, or phone depending on trxCode. */
  cpi: string;
  /** Square image size in pixels. */
  size: number | string;
}

export interface QrGenerateResponse {
  ResponseCode: string;
  RequestID: string;
  ResponseDescription: string;
  QRCode: string;
}

export interface QrModule {
  generate(input: QrGenerateInput): Promise<QrGenerateResponse>;
}
