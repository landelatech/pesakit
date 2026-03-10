/**
 * B2C (Business to Customer) – send money to customers.
 */

import type { HttpClient } from "../../http";
import { MpesaValidationError } from "../../errors";
import {
  normalizePhone,
  requireNonEmpty,
  requirePositiveAmount,
  validatePhone,
  validateUrl,
} from "../../utils/validation";
import type { B2CModule, B2CSendInput, B2CSendResponse } from "./types";

export interface B2CModuleConfig {
  http: HttpClient;
  shortCode: string;
  initiatorName: string;
  securityCredential: string;
}

export function createB2CModule(config: B2CModuleConfig): B2CModule {
  const { http, shortCode, initiatorName, securityCredential } = config;

  return {
    /**
     * Initiate B2C payment (business to customer).
     * Result and timeout callbacks are sent to the provided URLs; use typed callback payloads on your server.
     */
    async send(input: B2CSendInput): Promise<B2CSendResponse> {
      requireNonEmpty(input.recipientPhone, "recipientPhone");
      requirePositiveAmount(input.amount, "amount");
      validateUrl(input.resultUrl, "resultUrl");
      validateUrl(input.queueTimeOutUrl, "queueTimeOutUrl");
      requireNonEmpty(input.remarks, "remarks");
      validatePhone(input.recipientPhone);

      const short = input.shortCode ?? shortCode;
      if (!short || !initiatorName || !securityCredential) {
        throw new MpesaValidationError(
          "B2C requires shortCode, initiatorName, and securityCredential in config"
        );
      }

      const partyB = normalizePhone(input.recipientPhone);

      const body: Record<string, string | number> = {
        InitiatorName: initiatorName,
        SecurityCredential: securityCredential,
        CommandID: input.commandId ?? "BusinessPayment",
        Amount: Math.round(input.amount),
        PartyA: short,
        PartyB: partyB,
        Remarks: input.remarks,
        QueueTimeOutURL: input.queueTimeOutUrl,
        ResultURL: input.resultUrl,
      };
      if (input.occasion !== undefined && input.occasion !== "") {
        body.Occasion = input.occasion;
      }

      return http.post<B2CSendResponse>("/mpesa/b2c/v1/paymentrequest", body);
    },
  };
}
