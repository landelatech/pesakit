import { MpesaValidationError } from "../../errors";
import type { HttpClient } from "../../http";
import { requireNonEmpty, requirePositiveInt } from "../../utils/validation";
import type { QrGenerateInput, QrGenerateResponse, QrModule, QrTransactionCode } from "./types";

export interface QrModuleConfig {
  http: HttpClient;
}

const QR_TRANSACTION_CODES: QrTransactionCode[] = ["BG", "WA", "PB", "SM", "SB"];

function validateTrxCode(value: string): QrTransactionCode {
  if ((QR_TRANSACTION_CODES as string[]).includes(value)) {
    return value as QrTransactionCode;
  }

  throw new MpesaValidationError(
    `Invalid trxCode: expected one of ${QR_TRANSACTION_CODES.join(", ")}, got: ${value}`
  );
}

export function createQrModule(config: QrModuleConfig): QrModule {
  const { http } = config;

  return {
    async generate(input: QrGenerateInput): Promise<QrGenerateResponse> {
      requireNonEmpty(input.merchantName, "merchantName");
      requireNonEmpty(input.refNo, "refNo");
      requireNonEmpty(input.cpi, "cpi");

      const trxCode = validateTrxCode(input.trxCode);
      const amount = requirePositiveInt(input.amount, "amount");
      const sizeValue =
        typeof input.size === "string" ? Number(input.size.trim()) : Number(input.size);
      const size = requirePositiveInt(sizeValue, "size");

      return http.post<QrGenerateResponse>("/mpesa/qrcode/v1/generate", {
        MerchantName: input.merchantName,
        RefNo: input.refNo,
        Amount: amount,
        TrxCode: trxCode,
        CPI: input.cpi,
        Size: String(size),
      });
    },
  };
}
