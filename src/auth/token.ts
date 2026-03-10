/**
 * OAuth token generation and in-memory caching for Daraja API.
 * Tokens expire after 1 hour; we refresh shortly before expiry.
 */

import { MpesaAuthError } from "../errors";

const TOKEN_EXPIRY_BUFFER_SEC = 60; // refresh 60s before expiry
const DARAJA_TOKEN_EXPIRY_SEC = 3599; // Daraja returns ~3599

export interface TokenResult {
  access_token: string;
  expires_in: string;
}

export interface TokenCache {
  token: string;
  expiresAt: number;
}

export function getOAuthUrl(environment: "sandbox" | "production"): string {
  const base =
    environment === "sandbox" ? "https://sandbox.safaricom.co.ke" : "https://api.safaricom.co.ke";
  return `${base}/oauth/v1/generate?grant_type=client_credentials`;
}

export async function fetchToken(
  url: string,
  consumerKey: string,
  consumerSecret: string
): Promise<TokenResult> {
  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`, "utf8").toString("base64");
  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    throw new MpesaAuthError("Failed to reach OAuth endpoint", {
      cause: error as Error,
    });
  }

  const text = await response.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    data = undefined;
  }

  if (!response.ok) {
    const body = data as { errorDescription?: string; error?: string } | undefined;
    const message =
      body?.errorDescription ?? body?.error ?? response.statusText ?? "Failed to get access token";
    throw new MpesaAuthError(message, { responseBody: data });
  }

  const result = data as TokenResult;
  if (!result?.access_token) {
    throw new MpesaAuthError("Invalid token response: missing access_token", {
      responseBody: data,
    });
  }

  return result;
}

export function isTokenExpired(cache: TokenCache, bufferSec = TOKEN_EXPIRY_BUFFER_SEC): boolean {
  return Date.now() >= cache.expiresAt - bufferSec * 1000;
}

export function parseExpiresIn(expiresIn: string): number {
  const sec = parseInt(expiresIn, 10);
  return Number.isFinite(sec) ? sec : DARAJA_TOKEN_EXPIRY_SEC;
}
