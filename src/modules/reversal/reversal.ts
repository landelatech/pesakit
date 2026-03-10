/**
 * Reversal API – reverse a previously completed M-Pesa transaction.
 */

import type { HttpClient } from "../../http";
import { MpesaValidationError } from "../../errors";
import { requireNonEmpty, requirePositiveAmount, validateUrl } from "../../utils/validation";
import type { ReversalInput, ReversalModule, ReversalResponse } from "./types";

export interface ReversalModuleConfig {
  http: HttpClient;
  shortCode: string;
  /** Initiator name from the M-Pesa portal. */
  initiatorName: string;
  /** Encrypted initiator password (RSA security credential). */
  securityCredential: string;
}

export function createReversalModule(config: ReversalModuleConfig): ReversalModule {
  const { http, shortCode, initiatorName, securityCredential } = config;

  return {
    /**
     * Request a reversal for a completed M-Pesa transaction.
     * Daraja responds asynchronously to the provided result and timeout URLs.
     */
    async reverse(input: ReversalInput): Promise<ReversalResponse> {
      requireNonEmpty(input.transactionId, "transactionId");
      requirePositiveAmount(input.amount, "amount");
      validateUrl(input.resultUrl, "resultUrl");
      validateUrl(input.queueTimeOutUrl, "queueTimeOutUrl");
      requireNonEmpty(input.remarks, "remarks");

      const short = input.shortCode ?? shortCode;
      if (!short || !initiatorName || !securityCredential) {
        throw new MpesaValidationError(
          "Reversal requires shortCode, initiatorName, and securityCredential in config"
        );
      }

      const receiverParty = input.receiverParty ?? short;
      const receiverIdentifierType = input.receiverIdentifierType ?? 4;

      const body: Record<string, string | number> = {
        Initiator: initiatorName,
        SecurityCredential: securityCredential,
        CommandID: input.commandId ?? "TransactionReversal",
        TransactionID: input.transactionId,
        Amount: Math.round(input.amount),
        ReceiverParty: receiverParty,
        // Daraja uses this misspelled field name on the wire.
        RecieverIdentifierType: receiverIdentifierType,
        ResultURL: input.resultUrl,
        QueueTimeOutURL: input.queueTimeOutUrl,
        Remarks: input.remarks,
      };

      if (input.occasion !== undefined && input.occasion !== "") {
        body.Occasion = input.occasion;
      }

      return http.post<ReversalResponse>("/mpesa/reversal/v1/request", body);
    },
  };
}
