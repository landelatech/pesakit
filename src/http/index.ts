/**
 * HTTP client for Daraja API.
 * Uses native fetch; no external HTTP dependency.
 */

import { MpesaRequestError } from "../errors";

export type HttpMethod = "GET" | "POST";

export interface HttpClientOptions {
  baseUrl: string;
  getAccessToken: () => Promise<string>;
}

export interface RequestOptions {
  method: HttpMethod;
  path: string;
  body?: unknown;
}

export class HttpClient {
  private readonly baseUrl: string;
  private readonly getAccessToken: () => Promise<string>;

  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.getAccessToken = options.getAccessToken;
  }

  async request<T>(options: RequestOptions): Promise<T> {
    const url = `${this.baseUrl}${options.path.startsWith("/") ? options.path : `/${options.path}`}`;
    const token = await this.getAccessToken();

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const init: RequestInit = {
      method: options.method,
      headers,
    };

    if (options.body !== undefined && options.body !== null) {
      init.body = JSON.stringify(options.body);
    }

    let response: Response;
    try {
      response = await fetch(url, init);
    } catch (err) {
      throw new MpesaRequestError((err as Error).message, { cause: err as Error });
    }
    const text = await response.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : undefined;
    } catch {
      data = text;
    }

    if (!response.ok) {
      const errorBody = data as { errorMessage?: string; error?: string } | undefined;
      const message =
        errorBody?.errorMessage ?? errorBody?.error ?? response.statusText ?? "Request failed";
      throw new MpesaRequestError(message, {
        statusCode: response.status,
        responseBody: data,
      });
    }

    return data as T;
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>({ method: "GET", path });
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>({ method: "POST", path, body });
  }
}
