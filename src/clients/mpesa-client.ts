/**
 * Main M-Pesa SDK client: fluent API and module wiring.
 */

import { AuthProvider } from "../auth";
import { HttpClient } from "../http";
import { getBaseUrl, type MpesaConfig, resolveConfig } from "../config";
import { createStkModule } from "../modules/stk/stk";
import type {
  StkModule,
  StkPushInput,
  StkPushResult,
  StkQueryInput,
  StkQueryResponse,
} from "../modules/stk/types";
import { createC2BModule } from "../modules/c2b/c2b";
import type { C2BModule } from "../modules/c2b/types";
import { createB2CModule } from "../modules/b2c/b2c";
import type { B2CModule } from "../modules/b2c/types";
import { createAccountModule } from "../modules/account/account";
import type { AccountModule } from "../modules/account/types";
import { createTransactionModule } from "../modules/transaction/transaction";
import type { TransactionModule } from "../modules/transaction/types";
import { createReversalModule } from "../modules/reversal/reversal";
import type { ReversalModule } from "../modules/reversal/types";
import { createQrModule } from "../modules/qr/qr";
import type { QrModule } from "../modules/qr/types";

/**
 * M-Pesa SDK client.
 *
 * Single entry point for all Daraja API operations. OAuth is handled automatically;
 * tokens are cached and refreshed before expiry.
 *
 * @example
 * ```ts
 * // With env vars (MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, etc. set):
 * const mpesa = new Mpesa({});
 *
 * // Or with explicit config:
 * const mpesa = new Mpesa({
 *   consumerKey: "...",
 *   consumerSecret: "...",
 *   environment: "sandbox",
 *   shortCode: "174379",
 *   passKey: "...",
 * });
 *
 * const res = await mpesa.stkPush({
 *   phoneNumber: "254708374149",
 *   amount: 10,
 *   callbackUrl: "https://example.com/callback",
 *   accountReference: "order-123",
 *   transactionDesc: "Payment",
 * });
 * console.log(res.CheckoutRequestID);
 * ```
 */
export class Mpesa {
  readonly c2b: C2BModule;
  readonly b2c: B2CModule;
  readonly account: AccountModule;
  readonly transaction: TransactionModule;
  readonly reversal: ReversalModule;
  readonly qr: QrModule;
  private readonly http: HttpClient;
  private readonly stk: StkModule;

  constructor(config: MpesaConfig = {}) {
    const resolved = resolveConfig(config);

    const auth = new AuthProvider({
      environment: resolved.environment,
      consumerKey: resolved.consumerKey,
      consumerSecret: resolved.consumerSecret,
    });

    const baseUrl = getBaseUrl(resolved.environment);
    this.http = new HttpClient({
      baseUrl,
      getAccessToken: () => auth.getAccessToken(),
    });

    const shortCode = resolved.shortCode;
    const passKey = resolved.passKey;
    const initiatorName = resolved.initiatorName;
    const securityCredential = resolved.securityCredential;

    this.stk = createStkModule({ http: this.http, shortCode, passKey });
    this.c2b = createC2BModule({
      http: this.http,
      shortCode,
      environment: resolved.environment,
    });
    this.b2c = createB2CModule({
      http: this.http,
      shortCode,
      initiatorName,
      securityCredential,
    });
    this.account = createAccountModule({
      http: this.http,
      shortCode,
      initiatorName,
      securityCredential,
    });
    this.transaction = createTransactionModule({
      http: this.http,
      shortCode,
      initiatorName,
      securityCredential,
    });
    this.reversal = createReversalModule({
      http: this.http,
      shortCode,
      initiatorName,
      securityCredential,
    });
    this.qr = createQrModule({ http: this.http });
  }

  /**
   * Initiate STK Push (Lipa Na M-Pesa Online).
   * Sends a prompt to the customer's phone; use the returned CheckoutRequestID with stkQuery().
   */
  async stkPush(input: StkPushInput): Promise<StkPushResult> {
    return this.stk.push(input);
  }

  /**
   * Query STK Push status using CheckoutRequestID from stkPush() response.
   */
  async stkQuery(input: StkQueryInput): Promise<StkQueryResponse> {
    return this.stk.query(input);
  }
}
