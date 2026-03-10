/**
 * C2B: Register URLs and simulate (sandbox).
 */

import type { Environment } from "../../config";
import { MpesaValidationError } from "../../errors";
import type { HttpClient } from "../../http";
import {
  normalizePhone,
  requirePositiveAmount,
  validatePhone,
  validateUrl,
} from "../../utils/validation";
import type {
  C2BModule,
  C2BRegisterUrlsInput,
  C2BRegisterUrlsResponse,
  C2BSimulateInput,
  C2BSimulateResponse,
} from "./types";

export interface C2BModuleConfig {
  http: HttpClient;
  shortCode: string;
  environment: Environment;
}

function normalizeRegisterUrlsResponse(
  response: C2BRegisterUrlsResponse & { OriginatorCoversationID?: string }
): C2BRegisterUrlsResponse {
  return {
    ConversationID: response.ConversationID,
    OriginatorConversationID:
      response.OriginatorConversationID ?? response.OriginatorCoversationID ?? "",
    ResponseDescription: response.ResponseDescription,
  };
}

export function createC2BModule(config: C2BModuleConfig): C2BModule {
  const { http, shortCode, environment } = config;

  return {
    /**
     * Register confirmation and validation URLs for C2B (paybill/till).
     * Call once per shortcode; use Daraja portal to change later.
     */
    async registerUrls(input: C2BRegisterUrlsInput): Promise<C2BRegisterUrlsResponse> {
      validateUrl(input.confirmationUrl, "confirmationUrl");
      validateUrl(input.validationUrl, "validationUrl");

      const short = input.shortCode ?? shortCode;
      if (!short) {
        throw new MpesaValidationError("C2B registerUrls requires shortCode in config");
      }

      const body = {
        ShortCode: short,
        ResponseType: input.responseType ?? "Completed",
        ConfirmationURL: input.confirmationUrl,
        ValidationURL: input.validationUrl,
      };

      const response = await http.post<
        C2BRegisterUrlsResponse & { OriginatorCoversationID?: string }
      >("/mpesa/c2b/v1/registerurl", body);

      return normalizeRegisterUrlsResponse(response);
    },

    /**
     * Simulate a C2B payment (sandbox only).
     * Registers a simulated payment to your paybill/till for testing.
     */
    async simulate(input: C2BSimulateInput): Promise<C2BSimulateResponse> {
      requirePositiveAmount(input.amount, "amount");
      validatePhone(input.msisdn);

      const short = input.shortCode ?? shortCode;
      if (!short) {
        throw new MpesaValidationError("C2B simulate requires shortCode in config");
      }
      if (environment === "production") {
        throw new MpesaValidationError("C2B simulate is only available in the sandbox environment");
      }

      const normalized = normalizePhone(input.msisdn);

      const body: Record<string, string | number> = {
        ShortCode: short,
        CommandID: input.commandId ?? "CustomerPayBillOnline",
        Amount: Math.round(input.amount),
        Msisdn: normalized,
      };
      if (input.billRefNumber !== undefined && input.billRefNumber !== "") {
        body.BillRefNumber = input.billRefNumber;
      }

      return http.post<C2BSimulateResponse>("/mpesa/c2b/v1/simulate", body);
    },
  };
}
