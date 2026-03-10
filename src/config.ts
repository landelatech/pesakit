/**
 * SDK configuration and base URLs.
 * Credentials can be passed in config or read from environment (see resolveConfig).
 */

import { MpesaValidationError } from "./errors";

export type Environment = "sandbox" | "production";

/** Environment variable names used when config values are not provided. */
export const MPESA_ENV_KEYS = {
  consumerKey: "MPESA_CONSUMER_KEY",
  consumerSecret: "MPESA_CONSUMER_SECRET",
  environment: "MPESA_ENVIRONMENT",
  shortCode: "MPESA_SHORT_CODE",
  passKey: "MPESA_PASS_KEY",
  initiatorName: "MPESA_INITIATOR_NAME",
  securityCredential: "MPESA_SECURITY_CREDENTIAL",
} as const;

const VALID_ENVIRONMENTS: Environment[] = ["sandbox", "production"];

export function getBaseUrl(environment: Environment): string {
  return environment === "sandbox"
    ? "https://sandbox.safaricom.co.ke"
    : "https://api.safaricom.co.ke";
}

export interface MpesaConfig {
  /** Consumer key from Daraja portal. Falls back to MPESA_CONSUMER_KEY. */
  consumerKey?: string;
  /** Consumer secret from Daraja portal. Falls back to MPESA_CONSUMER_SECRET. */
  consumerSecret?: string;
  /** Environment: sandbox (testing) or production. Falls back to MPESA_ENVIRONMENT. */
  environment?: Environment;
  /** Shortcode (Paybill or Till). Falls back to MPESA_SHORT_CODE. */
  shortCode?: string;
  /** Lipa Na M-Pesa passkey. Falls back to MPESA_PASS_KEY. */
  passKey?: string;
  /** B2C initiator name. Falls back to MPESA_INITIATOR_NAME. */
  initiatorName?: string;
  /** B2C security credential (encrypted). Falls back to MPESA_SECURITY_CREDENTIAL. */
  securityCredential?: string;
}

/** Resolved config with required auth fields set (used internally). */
export interface ResolvedMpesaConfig {
  consumerKey: string;
  consumerSecret: string;
  environment: Environment;
  shortCode: string;
  passKey: string;
  initiatorName: string;
  securityCredential: string;
}

function getEnv(key: string): string {
  if (typeof process === "undefined" || !process.env) return "";
  return (process.env[key] ?? "").trim();
}

function resolveEnvironment(value: string | undefined): Environment {
  if (!value) {
    return "sandbox";
  }

  const normalized = value.toLowerCase();
  if (VALID_ENVIRONMENTS.includes(normalized as Environment)) {
    return normalized as Environment;
  }

  throw new MpesaValidationError(
    `Invalid environment: expected one of ${VALID_ENVIRONMENTS.join(", ")}, got: ${value}`
  );
}

/**
 * Resolves config by merging constructor options with environment variables.
 * Explicit config values take precedence; missing values are read from env.
 * Throws MpesaValidationError if consumerKey, consumerSecret, or environment are missing.
 */
export function resolveConfig(config: MpesaConfig): ResolvedMpesaConfig {
  const consumerKey = config.consumerKey ?? getEnv(MPESA_ENV_KEYS.consumerKey);
  const consumerSecret = config.consumerSecret ?? getEnv(MPESA_ENV_KEYS.consumerSecret);
  const environment = resolveEnvironment(config.environment ?? getEnv(MPESA_ENV_KEYS.environment));

  if (!consumerKey || !consumerSecret) {
    throw new MpesaValidationError(
      "Missing required credentials: set consumerKey and consumerSecret in config or " +
        `${MPESA_ENV_KEYS.consumerKey} and ${MPESA_ENV_KEYS.consumerSecret} in the environment.`
    );
  }

  return {
    consumerKey,
    consumerSecret,
    environment,
    shortCode: config.shortCode ?? getEnv(MPESA_ENV_KEYS.shortCode) ?? "",
    passKey: config.passKey ?? getEnv(MPESA_ENV_KEYS.passKey) ?? "",
    initiatorName: config.initiatorName ?? getEnv(MPESA_ENV_KEYS.initiatorName) ?? "",
    securityCredential:
      config.securityCredential ?? getEnv(MPESA_ENV_KEYS.securityCredential) ?? "",
  };
}
