/**
 * Auth module: OAuth token provider with in-memory cache and automatic refresh.
 */

import { getOAuthUrl, fetchToken, isTokenExpired, parseExpiresIn, type TokenCache } from "./token";

export interface AuthConfig {
  environment: "sandbox" | "production";
  consumerKey: string;
  consumerSecret: string;
}

export class AuthProvider {
  private readonly config: AuthConfig;
  private cache: TokenCache | null = null;
  private pendingToken: Promise<string> | null = null;

  constructor(config: AuthConfig) {
    this.config = config;
  }

  /** Returns a valid access token, refreshing if necessary. */
  async getAccessToken(): Promise<string> {
    if (this.cache && !isTokenExpired(this.cache)) {
      return this.cache.token;
    }

    this.pendingToken ??= this.refreshToken();

    try {
      return await this.pendingToken;
    } finally {
      this.pendingToken = null;
    }
  }

  /** Clear cached token (e.g. for testing or forced refresh). */
  clearCache(): void {
    this.cache = null;
    this.pendingToken = null;
  }

  private async refreshToken(): Promise<string> {
    const url = getOAuthUrl(this.config.environment);
    const result = await fetchToken(url, this.config.consumerKey, this.config.consumerSecret);

    const expiresIn = parseExpiresIn(result.expires_in);
    this.cache = {
      token: result.access_token,
      expiresAt: Date.now() + expiresIn * 1000,
    };

    return this.cache.token;
  }
}
